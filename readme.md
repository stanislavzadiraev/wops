# Локальный WordPress
## Подготовка системы
### Docker
```sh
# установка
sudo snap install docker --classic

#подготовка
sudo groupadd docker
sudo usermod --append --groups docker $USER
# точно требуется выход пользователя из истемы
# возможно требуется презагрузка системы
```
###  NodeJS
```sh
# установка
sudo snap install node --classic
```
## Подготовка проекта
`package.json`
 ```js
/// Установка
  "devDependencies": {
    ///...
    "wops": "github:stanislavzadiraev/wops",
    ///...
  },
///...

/// Подключение
  "scripts": {
    ///..
    "wops": "wops",
    ///...
  },
///...
```
## Работа пакета
### Конфигурация
`wops.config.js`

файл конфигурации с минимальным числом параметров
```js
export default {
}
```
файл конфигурации с максимальным числом параметров
```js
export default {

    // точка монтирования в проект файловой системы MySQL 
    dbpath: 'database',

    // параметры MySQL
    dbname: 'base',
    dbuser: 'user',
    dbword: 'word',

    // порт доступа PHPmyAdminer
    dbport: '9090',

    //точка монтирования в проект файловой системы Wordpress
    wppath: 'wordpress',

    // параметры WordPress
    wptitle: 'Some Title',
    wplang: 'ru_RU',
    wpuser: 'user',
    wpword: 'word',
    wpmail: 'mail@nowhere.void',

    // порт доступа WordPress
    wpport: '8080',

    // плагины к установке
    plugins: [
      'create-block-theme',
      'media-sync',
      'icon-block',
    ],
    
    // темы к установке
    themes: [
      'understrap',
    ],

    // точки монтирования файловых подсистем WordPress (wp-content)
    wpcontent: [
      ['themes', 'themes'],
      ['plugins', 'plugins'],
      ['uploads', 'uploads'],
    ],

}
```
### Выполнение
```sh
# создание окружения
npm run wops build

# удаление окружения
npm run wops prune
```
### Окружение
- файл конфигурации Docker Compose
- файловая подсистема MySQL
- файловая подсистема Wordpress
- прочие файловые подсистемы