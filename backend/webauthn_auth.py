# Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
# Use of this source code is governed by an GNU Affero General Public License v3.0
# license that can be found in the LICENSE file.

import base64
from typing import Dict, Any, Optional, List, Tuple

from webauthn import (
    generate_authentication_options,
    generate_registration_options,
    verify_authentication_response,
    verify_registration_response,
    options_to_json
)
from webauthn.helpers import parse_authentication_credential_json, parse_registration_credential_json
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

def get_rp_id():
    """Get the relying party ID based on environment."""
    if ENVIRONMENT == "development":
        return "localhost"
    else:
        return "kadenbilyeu.com"

def get_expected_origin():
    """Get the expected origin based on environment."""
    if ENVIRONMENT == "development":
        return "http://localhost:5173"
    else:
        return "https://kadenbilyeu.com"

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
                print(f"Error processing credential {cred.credential_id}: {e}")

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
        if isinstance(credential_json, str):
            parsed_credential = parse_registration_credential_json(credential_json)
        else:
            import json
            parsed_credential = parse_registration_credential_json(json.dumps(credential_json))

        verification = verify_registration_response(
            credential=parsed_credential,
            expected_challenge=challenge,
            expected_rp_id=get_rp_id(),
            expected_origin=get_expected_origin(),
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
        print(f"Successfully registered new WebAuthn credential: {credential_id_b64[:16]}...")
        return True

    except Exception as e:
        print(f"WebAuthn registration verification failed: {str(e)}")
        import traceback
        traceback.print_exc()
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
        print(f"Got {len(credentials)} credentials from database")

        if not credentials:
            raise ValueError("No WebAuthn credentials found for user")

        allow_credentials = []
        for cred in credentials:
            print(f"Processing credential: {cred.credential_id[:16]}...")
            try:
                cred_id_bytes = base64url_to_bytes(cred.credential_id)
                print(f"  Converted credential ID to bytes: {len(cred_id_bytes)} bytes")
                allow_credentials.append(
                    PublicKeyCredentialDescriptor(
                        id=cred_id_bytes,
                        type=PublicKeyCredentialType.PUBLIC_KEY
                    )
                )
            except Exception as e:
                print(f"Error creating credential descriptor for {cred.credential_id[:16]}...: {e}")

        print(f"Created {len(allow_credentials)} allow_credentials")

        authentication_options = generate_authentication_options(
            rp_id=get_rp_id(),
            allow_credentials=allow_credentials,
            user_verification=UserVerificationRequirement.PREFERRED,
        )

        print(f"Authentication options challenge: {authentication_options.challenge}")

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
        if isinstance(credential_json, str):
            parsed_credential = parse_authentication_credential_json(credential_json)
        else:
            import json
            parsed_credential = parse_authentication_credential_json(json.dumps(credential_json))
        credential_id_b64 = bytes_to_base64url(parsed_credential.raw_id)

        print(f"Received credential_id_b64: {credential_id_b64}")

        matching_credential = func_get_webauthn_credential_by_id(db, credential_id_b64)

        if not matching_credential:
            print(f"No matching credential found for {credential_id_b64[:16]}...")
            return False

        print(f"Found matching credential: {matching_credential.credential_id[:16]}...")

        try:
            verification = verify_authentication_response(
                credential=parsed_credential,
                expected_challenge=challenge,
                expected_rp_id=get_rp_id(),
                expected_origin=get_expected_origin(),
                credential_public_key=matching_credential.public_key,
                credential_current_sign_count=matching_credential.sign_count,
                require_user_verification=False,
            )

            # If verification succeeds, it returns a VerifiedAuthentication object
            # If it fails, it raises an exception
            func_update_webauthn_credential_sign_count(
                db, credential_id_b64, verification.new_sign_count
            )
            print(f"✅ WebAuthn authentication successful for {credential_id_b64[:16]}...")
            return True

        except InvalidAuthenticationResponse as e:
            print(f"❌ WebAuthn verification failed: {e}")
            return False

    except Exception as e:
        print(f"WebAuthn authentication verification failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        db.close()

webauthn_challenges = {}

def store_challenge(challenge_id: str, challenge: str):
    """Store a WebAuthn challenge temporarily."""
    webauthn_challenges[challenge_id] = challenge

def get_challenge(challenge_id: str) -> Optional[str]:
    """Retrieve and remove a WebAuthn challenge."""
    return webauthn_challenges.pop(challenge_id, None)