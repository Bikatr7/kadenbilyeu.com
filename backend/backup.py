import os
import shutil
import zipfile
import smtplib
from email.message import EmailMessage
from gnupg import GPG
from datetime import datetime

##----------------------------------/----------------------------------##

def get_envs():

    with open(".smtp.env", "r") as f:
        for line in f:
            key, value = line.strip().split("=")
            os.environ[key] = value

    ENCRYPTION_KEY:str = os.getenv('ENCRYPTION_KEY') or ""
    SMTP_SERVER:str = os.getenv('SMTP_SERVER') or ""
    SMTP_PORT:int = int(os.getenv('SMTP_PORT') or 0)
    SMTP_USER = os.getenv('SMTP_USER') or ""
    SMTP_PASSWORD = os.getenv('SMTP_PASSWORD') or ""
    FROM_EMAIL = os.getenv('FROM_EMAIL') or ""
    TO_EMAIL = os.getenv('TO_EMAIL') or ""

    assert ENCRYPTION_KEY != "", "ENCRYPTION_KEY is required"
    assert SMTP_SERVER != "", "SMTP_SERVER is required"
    assert SMTP_PORT != 0, "SMTP_PORT is required"
    assert SMTP_USER != "", "SMTP_USER is required"
    assert SMTP_PASSWORD != "", "SMTP_PASSWORD is required"
    assert FROM_EMAIL != "", "FROM_EMAIL is required"
    assert TO_EMAIL != "", "TO_EMAIL is required"

    return ENCRYPTION_KEY, SMTP_SERVER, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, FROM_EMAIL, TO_EMAIL

##----------------------------------/----------------------------------##

def export_db(db_path, export_path):
    shutil.copy(db_path, export_path)
    return export_path

def encrypt_file(file_path, passphrase):
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
        
    if not status.ok:
        raise ValueError('Failed to encrypt the file:', status.stderr)

    return encrypted_path

##----------------------------------/----------------------------------##

def compress_file(file_path):
    compressed_path = file_path + '.zip'
    with zipfile.ZipFile(compressed_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        zipf.write(file_path, os.path.basename(file_path))
    return compressed_path

##----------------------------------/----------------------------------##

def send_email(subject, body, to_email, attachment_path, from_email, smtp_server, smtp_port, smtp_user, smtp_password):
    msg = EmailMessage()
    msg['Subject'] = subject
    msg['From'] = from_email
    msg['To'] = to_email
    msg.set_content(body)

    with open(attachment_path, 'rb') as f:
        file_data = f.read()
        file_name = attachment_path.split('/')[-1]

    msg.add_attachment(file_data, maintype='application', subtype='octet-stream', filename=file_name)

    with smtplib.SMTP_SSL(smtp_server, smtp_port) as server:
        server.login(smtp_user, smtp_password)
        server.send_message(msg)

##----------------------------------/----------------------------------##

def main():

    ENCRYPTION_KEY, SMTP_SERVER, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, FROM_EMAIL, TO_EMAIL = get_envs()

    db_path = 'blog.db'
    export_path = f'exported_db_{datetime.now().strftime("%Y%m%d%H%M%S")}.db'
    export_db(db_path, export_path)

    encrypted_path = encrypt_file(export_path, ENCRYPTION_KEY)
    compressed_path = compress_file(encrypted_path)

    send_email(
        subject='Daily SQLite Database Backup',
        body='Please find the attached encrypted and compressed SQLite database backup.',
        to_email=TO_EMAIL,
        attachment_path=compressed_path,
        from_email=FROM_EMAIL,
        smtp_server=SMTP_SERVER,
        smtp_port=SMTP_PORT,
        smtp_user=SMTP_USER,
        smtp_password=SMTP_PASSWORD
    )

##----------------------------------/----------------------------------##

if(__name__ == '__main__'):
    main()
