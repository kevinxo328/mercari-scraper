import time

from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By


def get_info(driver):
    layout = driver.find_element(by=By.ID, value='search-result')
    items = layout.find_elements(by=By.CSS_SELECTOR, value='[data-testid="item-cell"]')

    data = [{'name': item.find_element(by=By.TAG_NAME, value='mer-item-thumbnail').get_attribute('item-name'),
             'price': item.find_element(by=By.TAG_NAME, value='mer-item-thumbnail').get_attribute('price'),
             'img': item.find_element(by=By.TAG_NAME, value='mer-item-thumbnail').get_attribute('src'),
             'link': item.find_element(by=By.TAG_NAME, value='a').get_attribute('href')}
            for item in items]
    print(data)


def scraper(keyword):
    service = Service(executable_path="./chromedriver")
    browser = webdriver.Chrome(service=service)
    baseurl = 'https://jp.mercari.com/'
    url = f'{baseurl}search?keyword={keyword}&status=on_sale'
    browser.get(url)
    time.sleep(8)
    get_info(browser)
    browser.quit()


if __name__ == '__main__':
    scraper('beams')
# See PyCharm help at https://www.jetbrains.com/help/pycharm/
