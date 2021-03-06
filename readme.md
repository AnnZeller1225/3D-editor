<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" type="text/css" href="./readme.css">
  </head>
  <body>
    <div class="center">Описание проекта</div>
       <p>
        3D редактор - это инструмент для дизайнеров и заказчиков,
        который позволяет воплотить 2d чертеж будущего проекта в 3D
        визуализацию. Заказчик или дизайнер загружает план проекта,
        с бэкенда приходит json с данными, которые рендерятся в
        полноценный 3d интерьер. Все изменения подвязаны на web-socket, что позволяет в режиме реального времени нескольким пользователям вносить изменения в один и тот же проект.
      </p>
   <a href="https://cryptic-headland-15726.herokuapp.com/#/">Demo</a>
      <p>Использованные технологии:</p>
      <ol>
        <li>React</li>
        <li>Redux</li>
        <li>Three.js</li>
        <li>Socket.io</li>
      </ol>
      <p>Реализованный функционал:</p>
      <ol>
        <li>Добавление объектов на сцену</li>
        <li>Удаление объектов</li>
        <li>Замена объектов</li>
        <li>Замена текстуры пола, потолка, стен</li>
        <li>Перемещение и поворот мебели </li>
        <li>Скрытие объектов</li>
        <li>Блокировка перемещения</li>
      </ol>
    <div class="structure">
    <span class="t2">Файловая структура</span>
      <ul>
        <li>
          client
          <ul>
            <li>public - лежат все модели и текстуры</li>
            <li>
              src
              <ul>
                <li>
                  action - функции, вызываемые при изменении глобального store
                </li>
                <li>
                  components
                  <ul>
                    <li>
                      App - роутинг для двух страниц - homePage и cartPage (на
                      будущее), основная homePage
                    </li>
                    <li>ErrorBoundry - заготовка под обработку ошибок</li>
                    <li>ErrorIndicator - заготовка под обработку ошибок</li>
                    <li>
                   <span class="imp">FloorList</span>  - список элементов комнаты слева от сцены</li>
                    <li>
                      <span class="imp">FloorPlan</span> - отрисовка сцены с стенами, мебелью и тд,
                      обработка событий, приходящих с сокета
                    </li>
                    <li>load-bar - модалка % загрузки мебели и текстур</li>
                    <li>ModalConfirm - подтверждающие окно при удалении</li>
                    <li>
                      modal-window - модалка для замены, добавления элементов
                    </li>
                    <li>ModelList - список новых предметов в модалке</li>
                    <li>
                      Navigation - верхняя панель-меню с названием проекта,
                      квартиры
                    </li>
                    <li>
                      scripts -
                      <ul>
                        <li>camera - настройки камеры</li>
                        <li>
                          initBasicScene - вспомогательные функции для файла
                          floor-plan - рисует стены, меняет текстуры, ставит
                          свет, камеру и тд.
                        </li>
                        <li>
                          outline - настройки для обводки моделей при выделении
                        </li>
                      </ul>
                    </li>
                    <li>settings - пока пусто</li>
                    <li>texture-list - список текстур в модалке</li>
                    <li>
                      wall - из json высчитывает угол поворота, длину стены и
                      возвращает стену
                    </li>
                    <li>Wall-item -для отображения в списке слева стороны стены и текстуры </li>
                  </ul>
                </li>
                <li>img - картинки, иконки и тд</li>
                <li>
                  reducers
                  <ul>
                    <li> <span class="imp"> main.js </span>
                     - хранит в себе состояние проекта, активной
                      модели, состояние камеры, модальных окон и тд
                    </li>
                    <li>
                      load.js - % загрузки моделей или текстур - для
                      всплывающего окна при завершении загрузки
                    </li>
                    <li>index.js - их комбинирует</li>
                  </ul>
                </li>
                <li>
                  utils / compose.js вспомогательная функция для удобной записи
                  в функции connect
                </li>
                <li>
                  index.js - корневой js, оборачивает все в провайдер,
                  обработчик ошибок и тд
                </li>
                <li>store.js - создание глобального store</li>
              </ul>
            </li>
          </ul>
        </li>
        <li>
          server - отслеживает сокеты и генерирует event для обновления их на
          клиенте
        </li>
      </ul>
    </div>
  </body>
</html>
