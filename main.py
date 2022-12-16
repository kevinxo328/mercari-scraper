import time, uuid
from datetime import datetime

from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from database import db_connect
from sqlalchemy import text


def go_next_page(driver):
    button = driver.find_element(by=By.CSS_SELECTOR, value='[data-testid="pagination-next-button"]')
    button.click()
    time.sleep(8)


def get_info(driver):
    layout = driver.find_element(by=By.ID, value='search-result')
    items = layout.find_elements(by=By.CSS_SELECTOR, value='[data-testid="item-cell"]')

    data = [{'id': uuid.uuid4(),
             'name': item.find_element(by=By.TAG_NAME, value='mer-item-thumbnail').get_attribute('item-name'),
             'price': int(item.find_element(by=By.TAG_NAME, value='mer-item-thumbnail').get_attribute('price')),
             'img': item.find_element(by=By.TAG_NAME, value='mer-item-thumbnail').get_attribute('src'),
             'link': item.find_element(by=By.TAG_NAME, value='a').get_attribute('href'),
             'createdDate': datetime.now()
             } for item in items]

    go_next_page(driver)
    return data


def scraper(keyword, user, price_max, price_min, conditionId):
    service = Service(executable_path="./chromedriver")
    browser = webdriver.Chrome(service=service)
    baseurl = 'https://jp.mercari.com/'
    url = f'{baseurl}search?keyword={keyword}&status=on_sale&price_max={price_max}&price_min={price_min}'
    browser.get(url)
    time.sleep(8)

    data = []

    # 開始爬蟲
    for num in range(0, 1):
        data.extend([{**info, 'userId': user, 'conditionId': conditionId} for info in get_info(driver=browser)])

    browser.quit()
    return data


if __name__ == '__main__':
    db = db_connect()
    conditions = db.execute(text('SELECT * FROM scraper_conditions'))

    # clear first
    db.execute(text('TRUNCATE TABLE scraper_results'))
    db.commit()

    for row in conditions:
        result = scraper(keyword=row.keyword, user=row.userId, price_max=row.priceMax, price_min=row.priceMin,
                         conditionId=row.id)
        db.execute(text(
            'INSERT INTO scraper_results (id, name, price, img, link, createdDate, userId, conditionId) '
            'VALUES (:id, :name, :price, :img, :link, :createdDate, :userId, :conditionId )'),
            result)
        db.commit()
