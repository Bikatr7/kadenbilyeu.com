## Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
## Use of this source code is governed by an GNU Affero General Public License v3.0
## license that can be found in the LICENSE file.

import os
import shutil
import zipfile
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders

from apscheduler.schedulers.background import BackgroundScheduler
from gnupg import GPG

from config import ENVIRONMENT, BACKUP_LOGS_DIR
from database import get_envs

def get_url() -> str:
    if(ENVIRONMENT == "development"):
        return "http://api.localhost:5000"

    return "https://api.kadenbilyeu.com"

## Backup functions
def export_db(db_path:str, export_path:str) -> str:
    """
    Export the SQLite database to a new file

    Args:
    db_path (str): The path to the SQLite database file
    export_path (str): The path to the exported SQLite database file

    Returns:
    export_path (str): The path to the exported SQLite database file
    """

    shutil.copy(db_path, export_path)
    return export_path

def encrypt_file(file_path:str, passphrase:str) -> str:
    """
    Encrypt the file using the GPG encryption algorithm

    Args:
    file_path (str): The path to the file to encrypt
    passphrase (str): The passphrase to encrypt the file with

    Returns:
    encrypted_path (str): The path to the encrypted file
    """

    gpg = GPG()
    encrypted_path = file_path + '.pgp'

    with open(file_path, 'rb') as f:
        status = gpg.encrypt_file(
            f,
            recipients=None,
            symmetric=True,
            passphrase=passphrase,
            output=encrypted_path
        )

    if(not status.ok):
        raise ValueError(f'Failed to encrypt the file: {status.stderr}')

    return encrypted_path

def decrypt_file(file_path:str, passphrase:str) -> str:
    """
    Decrypt the file using the GPG encryption algorithm

    Args:
    file_path (str): The path to the file to decrypt

    Returns:
    decrypted_path (str): The path to the decrypted file
    """

    gpg = GPG()
    decrypted_path = file_path.replace('.pgp', '')

    with open(file_path, 'rb') as f:
        status = gpg.decrypt_file(
            f,
            passphrase=passphrase,
            output=decrypted_path
        )

    if(not status.ok):
        raise ValueError(f'Failed to decrypt the file: {status.stderr}')

    return decrypted_path

def compress_file(file_path:str) -> str:
    """
    Compress the file into a zip archive

    Args:
    file_path (str): The path to the file to compress

    Returns:
    compressed_path (str): The path to the compressed file
    """

    compressed_path = file_path + '.zip'

    with zipfile.ZipFile(compressed_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        zipf.write(file_path, os.path.basename(file_path))

    return compressed_path

def decompress_file(file_path:str, decompressed_path:str) -> str:
    """
    Decompress the file from a zip archive

    Args:
    file_path (str): The path to the file to decompress

    Returns:
    decompressed_path (str): The path to the decompressed file
    """

    with zipfile.ZipFile(file_path, 'r') as zipf:

        ## Extract all files to a temporary directory
        temp_dir = os.path.join(os.getcwd(), "temp_extracted")
        os.makedirs(temp_dir, exist_ok=True)
        zipf.extractall(temp_dir)

        extracted_files = os.listdir(temp_dir)

        if(not extracted_files):
            raise FileNotFoundError("No files found in the zip archive")

        extracted_file = extracted_files[0]
        extracted_file_path = os.path.join(temp_dir, extracted_file)

        shutil.move(extracted_file_path, decompressed_path)

        shutil.rmtree(temp_dir)

    return decompressed_path

def send_email(subject:str, body:str, to_email:str, attachment_path:str, from_email:str, smtp_server:str, smtp_port:int, smtp_user:str, smtp_password:str) -> None:
    """
    Send an email with an attachment

    Args:
    subject (str): The subject of the email
    body (str): The body of the email
    to_email (str): The recipient email address
    attachment_path (str): The path to the attachment file
    from_email (str): The sender email address
    smtp_server (str): The SMTP server
    smtp_port (int): The SMTP port
    smtp_user (str): The SMTP username
    smtp_password (str): The SMTP password
    """

    msg = MIMEMultipart()
    msg['From'] = from_email
    msg['To'] = to_email
    msg['Subject'] = subject

    msg.attach(MIMEText(body, 'plain'))

    # Attach the file
    with open(attachment_path, 'rb') as attachment:
        part = MIMEBase('application', 'octet-stream')
        part.set_payload(attachment.read())
        encoders.encode_base64(part)
        part.add_header('Content-Disposition', f"attachment; filename={os.path.basename(attachment_path)}")
        msg.attach(part)

    server = smtplib.SMTP(smtp_server, smtp_port)
    server.starttls()
    server.login(smtp_user, smtp_password)
    text = msg.as_string()
    server.sendmail(from_email, to_email, text)
    server.quit()

def perform_backup() -> None:
    """
    Perform the backup process
    """

    try:
        ENCRYPTION_KEY, SMTP_SERVER, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, FROM_EMAIL, TO_EMAIL, enable_emails = get_envs()

        if not enable_emails:
            print("Backup disabled (ENABLE_BACKUP_EMAILS is set to false)")
            return

        from config import DATABASE_PATH

        # Export the database
        export_path = export_db(DATABASE_PATH, f"{DATABASE_PATH}.backup")

        # Compress the exported database
        compressed_path = compress_file(export_path)

        # Encrypt the compressed database
        encrypted_path = encrypt_file(compressed_path, ENCRYPTION_KEY)

        # Send the encrypted backup via email
        subject = "Database Backup"
        body = "Attached is the encrypted database backup."
        send_email(subject, body, TO_EMAIL, encrypted_path, FROM_EMAIL, SMTP_SERVER, SMTP_PORT, SMTP_USER, SMTP_PASSWORD)

        # Clean up temporary files
        os.remove(export_path)
        os.remove(compressed_path)
        os.remove(encrypted_path)

        print("Backup completed successfully")

    except Exception as e:
        print(f"Backup failed: {str(e)}")

def perform_backup_scheduled() -> None:
    """
    Perform the backup process on a scheduled interval
    """
    perform_backup()

def start_scheduler():
    try:
        ENCRYPTION_KEY, SMTP_SERVER, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, FROM_EMAIL, TO_EMAIL, enable_emails = get_envs()
        if not enable_emails:
            print("Backup scheduler disabled (ENABLE_BACKUP_EMAILS is set to false)")
            return

        scheduler = BackgroundScheduler()
        scheduler.add_job(perform_backup_scheduled, 'interval', hours=24)  # Backup every 24 hours
        scheduler.start()

        print("Backup scheduler started")

    except Exception as e:
        print(f"Failed to start backup scheduler: {str(e)}")
