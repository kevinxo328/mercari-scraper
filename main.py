import time
from datetime import datetime

from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from database import connect_db


def go_next_page(driver):
    button = driver.find_element(by=By.CSS_SELECTOR, value='[data-testid="pagination-next-button"]')
    button.click()
    time.sleep(8)


def get_info(driver):
    layout = driver.find_element(by=By.ID, value='search-result')
    items = layout.find_elements(by=By.CSS_SELECTOR, value='[data-testid="item-cell"]')

    data = [{'name': item.find_element(by=By.TAG_NAME, value='mer-item-thumbnail').get_attribute('item-name'),
             'price': int(item.find_element(by=By.TAG_NAME, value='mer-item-thumbnail').get_attribute('price')),
             'img': item.find_element(by=By.TAG_NAME, value='mer-item-thumbnail').get_attribute('src'),
             'link': item.find_element(by=By.TAG_NAME, value='a').get_attribute('href'), 'created-date': datetime.now()}
            for item in items]

    go_next_page(driver)
    return data


def scraper(collection, keyword, user, price_max, price_min):
    service = Service(executable_path="./chromedriver")
    browser = webdriver.Chrome(service=service)
    baseurl = 'https://jp.mercari.com/'
    url = f'{baseurl}search?keyword={keyword}&status=on_sale&price_max={price_max}&price_min={price_min}'
    browser.get(url)
    time.sleep(8)

    data = []

    # 開始爬蟲
    for num in range(0, 2):
        data.extend([{**info, 'user': user} for info in get_info(driver=browser)])

    collection.insert_many(data)

    browser.quit()


if __name__ == '__main__':
    db = connect_db()
    condition_collection = db['scraper_conditions']
    result_collection = db['scraper_results']
    result_collection.delete_many({})

    for condition in condition_collection.find({}):
        scraper(collection=result_collection, keyword=condition['keyword'], user=condition['user'],
                price_max=condition.get('price_max'), price_min=condition.get('price_min'))
# See PyCharm help at https://www.jetbrains.com/help/pycharm/
