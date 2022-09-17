from dotenv import dotenv_values
from pymongo import MongoClient


def connect_db():
    try:
        config = dotenv_values(".env")
        client = MongoClient(config['DB_URL'], serverSelectionTimeoutMS=5000)
        db = client[config['DB_NAME']]
        return db
    except Exception as err:
        print("Unable to connect to the server.")
        print(err)


if __name__ == '__main__':
    connect_db()
