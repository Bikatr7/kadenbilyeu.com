# Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
# Use of this source code is governed by an GNU Affero General Public License v3.0
# license that can be found in the LICENSE file.

import json
from typing import Any, Optional, Dict
from datetime import datetime, timedelta, timezone

from webauthn import (
    generate_authentication_options,
    generate_registration_options,
    verify_authentication_response,
    verify_registration_response,
    options_to_json
)
from webauthn.helpers import parse_authentication_credential_json, parse_registration_credential_json, parse_client_data_json
from webauthn.helpers import (
    base64url_to_bytes,
    bytes_to_base64url,
)
from webauthn.helpers.exceptions import InvalidAuthenticationResponse, InvalidRegistrationResponse
from webauthn.helpers.structs import (
    PublicKeyCredentialDescriptor,
    PublicKeyCredentialType,
    UserVerificationRequirement,
    AttestationConveyancePreference,
    AuthenticatorSelectionCriteria,
    ResidentKeyRequirement
)

from config import ENVIRONMENT
from database import (
    func_get_webauthn_credentials,
    func_get_webauthn_credential_by_id,
    func_create_webauthn_credential,
    func_update_webauthn_credential_sign_count,
    WebAuthnCredentialCreate,
    get_db
)

import logging
import base64

logger = logging.getLogger(__name__)

def get_rp_id():
    """Get the relying party ID based on environment."""
    if ENVIRONMENT == "development":
        return "localhost"
    else:
        return "kadenbilyeu.com"

def get_expected_origins():
    """Get the expected origins based on environment."""
    if ENVIRONMENT == "development":
        return ["http://localhost:5173"]
    else:
        return ["https://kadenbilyeu.com", "https://bikatr7.com"]

def get_expected_origin():
    """Get the expected origin based on environment (legacy function)."""
    return get_expected_origins()[0]

def get_origin_from_client_data_json(client_data_json: bytes) -> str:
    """
    Extract the origin from client_data_json.

    Args:
        client_data_json: The client data JSON as bytes

    Returns:
        The origin string
    """
    client_data_str = client_data_json.decode('utf-8')
    client_data = json.loads(client_data_str)
    return client_data.get('origin', '')


def _to_base64url(value: str) -> str:
    """Convert base64 (standard) string to base64url without padding. If already base64url, return as-is."""
    try:
        # Normalize padding for base64 decode
        padded = value + "==="
        decoded = base64.b64decode(padded)
        return bytes_to_base64url(decoded)
    except Exception:
        return value


def normalize_registration_credential_b64(credential_obj: dict) -> dict:
    """Ensure registration credential fields use base64url encoding expected by the webauthn lib."""
    obj = dict(credential_obj)
    try:
        obj['rawId'] = _to_base64url(obj.get('rawId', ''))
        resp = dict(obj.get('response', {}))
        if 'attestationObject' in resp:
            resp['attestationObject'] = _to_base64url(resp['attestationObject'])
        if 'clientDataJSON' in resp:
            resp['clientDataJSON'] = _to_base64url(resp['clientDataJSON'])
        obj['response'] = resp
    except Exception:
        pass
    return obj


def normalize_authentication_credential_b64(credential_obj: dict) -> dict:
    """Ensure authentication credential fields use base64url encoding expected by the webauthn lib."""
    obj = dict(credential_obj)
    try:
        obj['rawId'] = _to_base64url(obj.get('rawId', ''))
        resp = dict(obj.get('response', {}))
        if 'authenticatorData' in resp:
            resp['authenticatorData'] = _to_base64url(resp['authenticatorData'])
        if 'clientDataJSON' in resp:
            resp['clientDataJSON'] = _to_base64url(resp['clientDataJSON'])
        if 'signature' in resp:
            resp['signature'] = _to_base64url(resp['signature'])
        if 'userHandle' in resp and resp['userHandle'] is not None:
            resp['userHandle'] = _to_base64url(resp['userHandle'])
        obj['response'] = resp
    except Exception:
        pass
    return obj

RP_NAME = "Kaden Bilyeu Admin"

def generate_webauthn_registration_options(user_id: str = "admin") -> tuple[str, bytes]:
    """
    Generate WebAuthn registration options for new credential registration.

    Args:
        user_id: The user ID (defaults to "admin")

    Returns:
        Tuple containing (options JSON string, challenge bytes)
    """
    db = next(get_db())
    try:
        existing_credentials = func_get_webauthn_credentials(db, user_id)

        exclude_credentials = []
        for cred in existing_credentials:
            try:
                cred_id_bytes = base64url_to_bytes(cred.credential_id)
                exclude_credentials.append(
                    PublicKeyCredentialDescriptor(
                        id=cred_id_bytes,
                        type=PublicKeyCredentialType.PUBLIC_KEY
                    )
                )
            except Exception as e:
                logger.warning(f"Error processing credential {cred.credential_id}: {e}")

        registration_options = generate_registration_options(
            rp_id=get_rp_id(),
            rp_name=RP_NAME,
            user_id=user_id.encode(),
            user_name=user_id,
            user_display_name="Admin User",
            exclude_credentials=exclude_credentials,
            authenticator_selection=AuthenticatorSelectionCriteria(
                user_verification=UserVerificationRequirement.PREFERRED,
                resident_key=ResidentKeyRequirement.PREFERRED
            ),
            attestation=AttestationConveyancePreference.NONE
        )

        return options_to_json(registration_options), registration_options.challenge
    finally:
        db.close()

def verify_webauthn_registration(credential_data: Dict[str, Any], challenge: bytes, user_id: str = "admin") -> bool:
    """
    Verify WebAuthn registration response and store new credential.

    Args:
        credential_data: The credential data from the client
        challenge: The challenge used in registration
        user_id: The user ID (defaults to "admin")

    Returns:
        bool: True if registration successful
    """
    db = next(get_db())
    try:
        credential_json = credential_data["credential"]
        if not isinstance(credential_json, str):
            credential_json = json.dumps(normalize_registration_credential_b64(credential_json))
        parsed_credential = parse_registration_credential_json(credential_json)

        # Extract origin from client_data_json
        origin = get_origin_from_client_data_json(parsed_credential.response.client_data_json)

        allowed_origins = get_expected_origins()
        if origin not in allowed_origins:
            logger.error(f"Origin {origin} not in allowed origins: {allowed_origins}")
            return False

        verification = verify_registration_response(
            credential=parsed_credential,
            expected_challenge=challenge,
            expected_rp_id=get_rp_id(),
            expected_origin=origin,
            require_user_verification=False,
        )

        # If verification succeeds, it returns a VerifiedRegistration object
        # If it fails, it raises an exception
        credential_id_b64 = bytes_to_base64url(verification.credential_id)

        new_credential = WebAuthnCredentialCreate(
            credential_id=credential_id_b64,
            public_key=verification.credential_public_key,
            sign_count=verification.sign_count,
            user_id=user_id
        )

        func_create_webauthn_credential(db, new_credential)
        logger.info(f"Registered new WebAuthn credential: {credential_id_b64[:16]}...")
        return True

    except Exception as e:
        logger.exception(f"WebAuthn registration verification failed: {str(e)}")
        return False
    finally:
        db.close()

def generate_webauthn_authentication_options(user_id: str = "admin") -> tuple[str, bytes]:
    """
    Generate WebAuthn authentication options for the admin user.

    Args:
        user_id: The user ID (defaults to "admin")

    Returns:
        Tuple containing (options JSON string, challenge bytes)
    """
    db = next(get_db())
    try:
        credentials = func_get_webauthn_credentials(db, user_id)
        logger.debug(f"Got {len(credentials)} credentials from database")

        if not credentials:
            raise ValueError("No WebAuthn credentials found for user")

        allow_credentials = []
        for cred in credentials:
            logger.debug(f"Processing credential: {cred.credential_id[:16]}...")
            try:
                cred_id_bytes = base64url_to_bytes(cred.credential_id)
                logger.debug(f"  Converted credential ID to bytes: {len(cred_id_bytes)} bytes")
                allow_credentials.append(
                    PublicKeyCredentialDescriptor(
                        id=cred_id_bytes,
                        type=PublicKeyCredentialType.PUBLIC_KEY
                    )
                )
            except Exception as e:
                logger.warning(f"Error creating credential descriptor for {cred.credential_id[:16]}...: {e}")

        logger.debug(f"Created {len(allow_credentials)} allow_credentials")

        authentication_options = generate_authentication_options(
            rp_id=get_rp_id(),
            allow_credentials=allow_credentials,
            user_verification=UserVerificationRequirement.PREFERRED,
        )

        logger.debug(f"Authentication options challenge: {authentication_options.challenge}")

        return options_to_json(authentication_options), authentication_options.challenge
    finally:
        db.close()

def verify_webauthn_authentication(credential_data: Dict[str, Any], challenge: bytes, user_id: str = "admin") -> bool:
    """
    Verify WebAuthn authentication response against database credentials.

    Args:
        credential_data: The credential data from the client
        challenge: The challenge used in authentication
        user_id: The user ID (defaults to "admin")

    Returns:
        bool: True if authentication successful
    """
    db = next(get_db())
    try:
        credential_json = credential_data["credential"]
        if not isinstance(credential_json, str):
            credential_json = json.dumps(normalize_authentication_credential_b64(credential_json))
        parsed_credential = parse_authentication_credential_json(credential_json)
        credential_id_b64 = bytes_to_base64url(parsed_credential.raw_id)

        logger.debug(f"Received credential_id_b64: {credential_id_b64}")

        matching_credential = func_get_webauthn_credential_by_id(db, credential_id_b64)

        if not matching_credential:
            logger.error(f"No matching credential found for {credential_id_b64[:16]}...")
            return False

        logger.debug(f"Found matching credential: {matching_credential.credential_id[:16]}...")

        # Extract origin from client_data_json
        origin = get_origin_from_client_data_json(parsed_credential.response.client_data_json)

        allowed_origins = get_expected_origins()
        if origin not in allowed_origins:
            logger.error(f"Origin {origin} not in allowed origins: {allowed_origins}")
            return False

        try:
            verification = verify_authentication_response(
                credential=parsed_credential,
                expected_challenge=challenge,
                expected_rp_id=get_rp_id(),
                expected_origin=origin,
                credential_public_key=matching_credential.public_key,
                credential_current_sign_count=matching_credential.sign_count,
                require_user_verification=False,
            )

            # If verification succeeds, it returns a VerifiedAuthentication object
            # If it fails, it raises an exception
            func_update_webauthn_credential_sign_count(
                db, credential_id_b64, verification.new_sign_count
            )
            logger.info(f"WebAuthn authentication successful for {credential_id_b64[:16]}...")
            return True

        except InvalidAuthenticationResponse as e:
            logger.warning(f"WebAuthn verification failed: {e}")
            return False

    except Exception as e:
        logger.exception(f"WebAuthn authentication verification failed: {str(e)}")
        return False
    finally:
        db.close()

WEBAUTHN_CHALLENGE_TTL = timedelta(minutes=5)


def store_challenge(challenge_id: str, challenge: str):
    """Store a WebAuthn challenge temporarily with expiration."""
    from database import func_store_webauthn_challenge, get_db
    expires_at = datetime.now(timezone.utc) + WEBAUTHN_CHALLENGE_TTL
    db = next(get_db())
    try:
        func_store_webauthn_challenge(db, challenge_id, challenge, expires_at)
    finally:
        db.close()


def get_challenge(challenge_id: str) -> Optional[str]:
    """Retrieve and remove a WebAuthn challenge if valid and not expired."""
    from database import func_get_webauthn_challenge, get_db
    db = next(get_db())
    try:
        return func_get_webauthn_challenge(db, challenge_id)
    finally:
        db.close()