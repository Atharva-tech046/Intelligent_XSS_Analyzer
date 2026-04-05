import os
import subprocess
import sys

REQUIRED_PACKAGES = {
    'flask': 'flask',
    'flask_cors': 'flask-cors',
    'flask_sqlalchemy': 'flask-sqlalchemy',
    'psycopg2': 'psycopg2-binary',
    'selenium': 'selenium',
    'webdriver_manager': 'webdriver-manager',
    'google.generativeai': 'google-generativeai',
    'dotenv': 'python-dotenv',
}


def check_imports():
    missing = []

    for module_name, package_name in REQUIRED_PACKAGES.items():
        try:
            __import__(module_name)
        except ImportError:
            missing.append((module_name, package_name))

    if missing:
        print('\n[VERIFIER] Missing Python packages detected:')
        for module_name, package_name in missing:
            print(f'  - {module_name} (package: {package_name})')
        return missing

    print('[VERIFIER] Python dependency check passed: all required packages are importable.')
    return []


def install_missing_dependencies():
    installer_path = os.path.join(os.path.dirname(__file__), 'install_deps.py')
    print('\n[VERIFIER] Missing dependencies found, launching installer...')
    result = subprocess.run([sys.executable, installer_path], capture_output=True, text=True)

    print(result.stdout)
    if result.returncode != 0:
        print('[VERIFIER] Installer failed to complete successfully.')
        print(result.stderr)
        sys.exit(result.returncode)

    print('[VERIFIER] Dependency installation completed, re-checking imports...')


def load_env_vars():
    try:
        from dotenv import load_dotenv
    except ImportError:
        print('\n[VERIFIER] Unable to import dotenv after installation. Exiting.')
        sys.exit(1)

    env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
    if os.path.exists(env_path):
        load_dotenv(env_path)
        print(f'[VERIFIER] Loaded environment variables from {env_path}')
    else:
        print('[VERIFIER] No .env file found at the repository root. Skipping .env load.')

    gemini_key = os.environ.get('GEMINI_API_KEY')
    google_key = os.environ.get('GOOGLE_API_KEY')

    if not gemini_key and not google_key:
        print('\n[VERIFIER] Environment check failed: neither GEMINI_API_KEY nor GOOGLE_API_KEY is set.')
        print('[VERIFIER] Please add one of these keys to your environment or .env file.')
        sys.exit(1)

    active_key = 'GEMINI_API_KEY' if gemini_key else 'GOOGLE_API_KEY'
    print(f'[VERIFIER] {active_key} is configured (value hidden).')


def main():
    print('[VERIFIER] Running IXA backend environment verification...')
    missing = check_imports()

    if missing:
        install_missing_dependencies()
        missing = check_imports()

    if missing:
        print('\n[VERIFIER] Dependency verification failed after installation.')
        sys.exit(1)

    load_env_vars()
    print('\n\033[92m[SUCCESS] Backend environment is ready for IXA.\033[0m')


if __name__ == '__main__':
    main()
