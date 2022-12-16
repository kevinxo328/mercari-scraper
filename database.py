from dotenv import dotenv_values
from sqlalchemy import create_engine, text


def db_connect():
    try:
        config = dotenv_values(".env")
        db_user = config['DB_USERNAME']
        db_password = config['DB_PASSWORD']
        db_host = config['DB_HOST']
        db_name = config['DB_DATABASE']
        db_url = f'mysql+pymysql://{db_user}:{db_password}@{db_host}/{db_name}'
        engine = create_engine(db_url, echo=True, future=True)
        
        return engine.connect()
    except Exception as err:
        print("Unable to connect to the server.")
        print(err)


if __name__ == '__main__':
    db_connect()
