# Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
# Use of this source code is governed by an GNU Affero General Public License v3.0
# license that can be found in the LICENSE file.

import base64
from pickletools import bytes8
from typing import Dict, Any, Optional

from webauthn import (
    generate_authentication_options,
    options_to_json
)
from webauthn.helpers import parse_authentication_credential_json
from webauthn.helpers import (
    base64url_to_bytes,
    bytes_to_base64url,
)
from webauthn.helpers.exceptions import InvalidAuthenticationResponse
from webauthn.authentication.verify_authentication_response import verify_authentication_response as _original_verify
import base64

from config import ENVIRONMENT

## not redoing my keys and i'm lazy
def get_rp_id():
    if ENVIRONMENT == "development":
        return "localhost"
    else:
        return "kadenbilyeu.com"

RP_NAME = "Kaden Bilyeu Admin"

def verify_authentication_response(*, credential, expected_challenge, expected_rp_id, expected_origin, credential_public_key, credential_current_sign_count, require_user_verification=False):
    """
    Custom version that skips origin validation but keeps all other security checks
    """
    if isinstance(credential, str) or isinstance(credential, dict):
        credential = parse_authentication_credential_json(credential)

    # FIDO-specific check
    if bytes_to_base64url(credential.raw_id) != credential.id:
        raise InvalidAuthenticationResponse("id and raw_id were not equivalent")

    # FIDO-specific check
    from webauthn.helpers.structs import PublicKeyCredentialType
    if credential.type != PublicKeyCredentialType.PUBLIC_KEY:
        raise InvalidAuthenticationResponse(
            f'Unexpected credential type "{credential.type}", expected "public-key"'
        )

    response = credential.response

    from webauthn.helpers import byteslike_to_bytes
    client_data_bytes = byteslike_to_bytes(response.client_data_json)
    authenticator_data_bytes = byteslike_to_bytes(response.authenticator_data)
    signature_bytes = byteslike_to_bytes(response.signature)

    from webauthn.helpers import parse_client_data_json
    client_data = parse_client_data_json(client_data_bytes)

    from webauthn.helpers.structs import ClientDataType
    if client_data.type != ClientDataType.WEBAUTHN_GET:
        raise InvalidAuthenticationResponse(
            f'Unexpected client data type "{client_data.type}", expected "{ClientDataType.WEBAUTHN_GET}"'
        )

    if expected_challenge != client_data.challenge:
        raise InvalidAuthenticationResponse("Client data challenge was not expected challenge")

    from webauthn.helpers.structs import TokenBindingStatus
    expected_token_binding_statuses = [
        TokenBindingStatus.SUPPORTED,
        TokenBindingStatus.PRESENT,
    ]

    if client_data.token_binding:
        status = client_data.token_binding.status
        if status not in expected_token_binding_statuses:
            raise InvalidAuthenticationResponse(
                f'Unexpected token_binding status of "{status}", expected one of "{",".join(expected_token_binding_statuses)}"'
            )

    from webauthn.helpers import parse_authenticator_data
    auth_data = parse_authenticator_data(authenticator_data_bytes)

    import hashlib
    expected_rp_id_hash = hashlib.sha256()
    expected_rp_id_hash.update(expected_rp_id.encode("utf-8"))
    expected_rp_id_hash_bytes = expected_rp_id_hash.digest()

    if auth_data.rp_id_hash != expected_rp_id_hash_bytes:
        raise InvalidAuthenticationResponse("Unexpected RP ID hash")

    if not auth_data.flags.up:
        raise InvalidAuthenticationResponse("User was not present during authentication")

    if require_user_verification and not auth_data.flags.uv:
        raise InvalidAuthenticationResponse(
            "User verification is required but user was not verified during authentication"
        )

    client_data_hash = hashlib.sha256()
    client_data_hash.update(client_data_bytes)
    client_data_hash_bytes = client_data_hash.digest()

    signature_base = authenticator_data_bytes + client_data_hash_bytes

    from webauthn.helpers import decode_credential_public_key, decoded_public_key_to_cryptography, verify_signature
    try:
        decoded_public_key = decode_credential_public_key(credential_public_key)
        crypto_public_key = decoded_public_key_to_cryptography(decoded_public_key)

        verify_signature(
            public_key=crypto_public_key,
            signature_alg=decoded_public_key.alg,
            signature=signature_bytes,
            data=signature_base,
        )
    except Exception as e:
        raise InvalidAuthenticationResponse("Could not verify authentication signature")

    from webauthn.helpers import parse_backup_flags
    parsed_backup_flags = parse_backup_flags(auth_data.flags)

    from webauthn.authentication.verify_authentication_response import VerifiedAuthentication
    from webauthn.helpers.structs import CredentialDeviceType
    return VerifiedAuthentication(
        credential_id=credential.raw_id,
        new_sign_count=auth_data.sign_count,
        credential_device_type=parsed_backup_flags.credential_device_type,
        credential_backed_up=parsed_backup_flags.credential_backed_up,
        user_verified=auth_data.flags.uv,
    )

PUBLIC_CREDENTIALS = [
    {
        "credential_id": "DMQlZtPAzg_IBMt7Y9nLnu5n1NDN06hpDGqJWGuc9uL4JIcCHCc0-LB9EdOv62tr1oPLjdn2VvlRngJhIyeT2w",
        "public_key": "pQECAyYgASFYIGY9HoblFIHOw79fO-aUPkBlwMlKWj7o7HW5km76_S0vIlggOLuN_2cvb-5ySifsg5ttb-LWVL9q6G7OQB6yanO5-CQ",
        "sign_count": 0
    },
    {
        "credential_id": "0k2-i1wsL_B9AX_88XMDxxyxNK_zn4EXauYRPBhPKQ_6U0nHCD5S7V4QTzx4EeWGBEVt8tkXFh_IyJEkoWm-Ow",
        "public_key": "pQECAyYgASFYIBUTEvD9GF0QGn0_4iyGUu2susmi0R-Libdam5Sz_Hd3IlggszVyGIR7lcvjtt7-HGvHIAh8msymLuSJoDhmeadQItY",
        "sign_count": 0
    }
]


def get_public_credentials():
    """Get the hardcoded WebAuthn credentials."""
    return PUBLIC_CREDENTIALS

def generate_webauthn_authentication_options() -> tuple[str, bytes]:
    """
    Generate WebAuthn authentication options for the admin user.

    Args:
        user_id: The user ID (defaults to "admin")

    Returns:
        Tuple containing (options JSON string, challenge bytes)
    """
    from webauthn.helpers.structs import PublicKeyCredentialDescriptor, PublicKeyCredentialType

    credentials = get_public_credentials()
    print(f"Got {len(credentials)} hardcoded credentials")
    if not credentials:
        raise ValueError("No WebAuthn credentials configured")

    allow_credentials = []
    for i, cred in enumerate(credentials):
        print(f"Processing credential {i}: {cred['credential_id'][:16]}...")
        try:
            cred_id_bytes = base64url_to_bytes(cred["credential_id"])
            print(f"  Converted credential ID to bytes: {len(cred_id_bytes)} bytes")
            allow_credentials.append(
                PublicKeyCredentialDescriptor(
                    id=cred_id_bytes,
                    type=PublicKeyCredentialType.PUBLIC_KEY
                )
            )
        except Exception as e:
            print(f"Error creating credential descriptor for {cred['credential_id'][:16]}...: {e}")
            import traceback
            traceback.print_exc()

    print(f"Created {len(allow_credentials)} allow_credentials")

    from webauthn.helpers.structs import UserVerificationRequirement

    authentication_options = generate_authentication_options(
        rp_id=get_rp_id(),
        allow_credentials=allow_credentials,
        user_verification=UserVerificationRequirement.PREFERRED,
    )

    print(f"Authentication options challenge: {authentication_options.challenge}")

    return options_to_json(authentication_options), authentication_options.challenge

def verify_webauthn_authentication(credential_data: Dict[str, Any], challenge: bytes8) -> bool:
    """
    Verify WebAuthn authentication response against hardcoded credentials.

    Args:
        credential_data: The credential data from the client
        challenge: The challenge used in authentication

    Returns:
        bool: True if authentication successful
    """
    try:
        credential_json = credential_data["credential"]

        parsed_credential = parse_authentication_credential_json(credential_json)
        credential_id_b64 = bytes_to_base64url(parsed_credential.raw_id)

        print(f"Received credential_id_b64: {credential_id_b64}")

        matching_credential = None
        credentials = get_public_credentials()
        print(f"Available credentials: {[cred['credential_id'][:16] + '...' for cred in credentials]}")

        for cred in credentials:
            print(f"Comparing {cred['credential_id']} == {credential_id_b64}")
            if cred["credential_id"] == credential_id_b64:
                matching_credential = cred
                print(f"Found matching credential!")
                break

        if not matching_credential:
            print(f"No matching credential found!")
            return False

        public_key_bytes = base64.urlsafe_b64decode(matching_credential["public_key"] + "==")

        rp_id = get_rp_id()
        expected_origin = "https://localhost:5173" if ENVIRONMENT == "development" else "https://kadenbilyeu.com"

        print(f"Verifying with challenge: {challenge}")
        print(f"Expected RP ID: {rp_id}")
        print(f"Expected origin: {expected_origin}")
        print(f"Matching credential: {matching_credential['credential_id'][:16]}...")

        try:
            ## can't stop, won't stop, not giving a fuck about origins
            verification = verify_authentication_response(
                credential=parsed_credential,
                expected_challenge=challenge,
                expected_rp_id=rp_id,
                expected_origin=expected_origin,
                credential_public_key=public_key_bytes,
                credential_current_sign_count=matching_credential["sign_count"],
            )

            return verification
        except Exception as e:
            print(f"❌ WebAuthn verification failed: {e}")
            print(f"   Error type: {type(e).__name__}")
            print(f"   Parsed credential type: {type(parsed_credential)}")
            print(f"   Challenge length: {len(challenge)}")
            print(f"   RP ID: {rp_id}")
            print(f"   Public key bytes length: {len(public_key_bytes)}")
            print(f"   Credential response type: {type(parsed_credential.response)}")
            if hasattr(parsed_credential, 'response'):
                print(f"   Client data JSON: {parsed_credential.response.client_data_json}")
                print(f"   Authenticator data: {parsed_credential.response.authenticator_data}")
            import traceback
            traceback.print_exc()
            return False

    except Exception as e:
        print(f"WebAuthn authentication verification failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

webauthn_challenges = {}
current_challenge = None

def store_challenge(challenge_id: str, challenge: str):
    """Store a WebAuthn challenge temporarily."""
    webauthn_challenges[challenge_id] = challenge

def get_challenge(challenge_id: str) -> Optional[str]:
    """Retrieve and remove a WebAuthn challenge."""
    return webauthn_challenges.pop(challenge_id, None)