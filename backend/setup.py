## Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
## Use of this source code is governed by an GNU Affero General Public License v3.0
## license that can be found in the LICENSE file.

## built-in libraries
import sys
import subprocess
import os

## Define the paths relative to the current working directory of the script
current_dir = os.path.dirname(os.path.abspath(__file__))

FRONTEND_ENV = os.path.join(current_dir, "../frontend/.env")
BACKEND_ENV = os.path.join(current_dir, ".env")

##-------------------start-of-install_dependencies()---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
def install_dependencies() -> None:
   
    ## Install python dependencies from requirements.
    try:
        assert os.path.exists('requirements.txt')
        subprocess.check_call([sys.executable, '-m', 'pip', 'install', '-r', 'requirements.txt'])

        print("Python dependencies installed successfully")

    except subprocess.CalledProcessError as e:
        print(f"Error: {e}")
        sys.exit(1)

    except AssertionError:
        print("Error: requirements.txt file not found")
        sys.exit(1)

##-------------------start-of-setup_local_environment()---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
def setup_local_environment() -> None:

    env_to_key_local = {
        "ADMIN_USER": "admin",
        "ADMIN_PASS_HASH": "$2b$12$MlPMcgDvVCU.s10xcB2fneIjZ/ymgz5O52yH5pshAFF5.bwPq4SMq",
        "TOTP_SECRET": "JBSWY3DPEHPK3PXP",
        "ACCESS_TOKEN_SECRET": "secret",
        "REFRESH_TOKEN_SECRET": "secret",
        "NODE_ENV": "development",
        "ENCRYPTION_KEY": "password",
        "SMTP_SERVER": "none",
        "SMTP_PORT": 8000,
        "SMTP_USER": "none",
        "SMTP_PASSWORD": "none",
        "FROM_EMAIL": "none",
        "TO_EMAIL": "none"
    }


    try:

        if(len(sys.argv) > 1 and sys.argv[1] == 'local'):

            print("Setting up local environment...")

            to_write_frontend = env_to_key_local["NODE_ENV"] + "\n"
            to_write_backend = (
                "ADMIN_USER=" + env_to_key_local["ADMIN_USER"] + "\n" +
                "ADMIN_PASS_HASH=" + env_to_key_local["ADMIN_PASS_HASH"] + "\n" +
                "TOTP_SECRET=" + env_to_key_local["TOTP_SECRET"] + "\n" +
                "ENVIRONMENT=development" + "\n" +
                "ACCESS_TOKEN_SECRET=" + env_to_key_local["ACCESS_TOKEN_SECRET"] + "\n"
                "REFRESH_TOKEN_SECRET=" + env_to_key_local["REFRESH_TOKEN_SECRET"] + "\n"
                "ENCRYPTION_KEY=" + env_to_key_local["ENCRYPTION_KEY"] + "\n"
            )
          
        else:

            print("Setting up production environment...")

            to_write_frontend = 'NODE_ENV=production\n'
        
        os.makedirs(os.path.dirname(FRONTEND_ENV), exist_ok=True)

        with open(FRONTEND_ENV, 'w') as f:
            f.write(to_write_frontend)

        with open(BACKEND_ENV, 'w') as f:
            f.write(to_write_backend)

        print("Environment setup successfully")

    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

##-------------------start-of-main()---------------------------------------------------------------------------------------------------------------------------------------------------------------------------

def main():
    install_dependencies()
    setup_local_environment()

if(__name__ == "__main__"):
    main()
