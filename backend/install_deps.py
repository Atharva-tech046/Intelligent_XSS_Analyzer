import subprocess
import sys

REQUIRED_PACKAGES = [
    'flask',
    'flask-cors',
    'flask-sqlalchemy',
    'psycopg2-binary',
    'selenium',
    'webdriver-manager',
    'google-generativeai',
    'python-dotenv',
]


def main():
    print('[INSTALLER] Updating and installing required dependencies...')
    command = [sys.executable, '-m', 'pip', 'install', '--upgrade'] + REQUIRED_PACKAGES
    print(f'[INSTALLER] Running: {" ".join(command)}')

    result = subprocess.run(command, capture_output=True, text=True)

    if result.returncode != 0:
        print('[INSTALLER] Installation failed with the following output:')
        print(result.stdout)
        print(result.stderr)
        sys.exit(result.returncode)

    print('[INSTALLER] Dependency installation completed successfully.')


if __name__ == '__main__':
    main()
