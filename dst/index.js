import { writeFile, mkdir, rmdir, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { userInfo } from 'node:os'

const {uid:UID, gid:GID} = userInfo()

const N = () => undefined

const MKDIR = $ => mkdir($, {recursive: true}).catch(N)
const RMDIR = $ => rmdir($, {recursive: true}).catch(N)

const build = ({
    dbpath = 'database',
    dbname = 'base',
    dbuser = 'user',
    dbword = 'word',
    dbport = '9090',

    wppath = 'wordpress',
    wplang = 'ru_RU',
    wpuser = 'user',
    wpword = 'word',
    wpmail = 'mail@nowhere.void',
    wpport = '8080',

    plugins = [
      'create-block-theme',
      'media-sync',
      'icon-block',
    ],
    
    themes = [
      'understrap',
    ],

    wpcontent = [
      ['themes', 'themes'],
      ['plugins', 'plugins'],
      ['uploads', 'uploads'],
    ],
  }) =>
  Promise.all([
    MKDIR(wppath),
    MKDIR(dbpath),
    Promise.all(wpcontent.map(([src, dst]) =>
      Promise.all([
        MKDIR(src),
        MKDIR(join(wppath, 'wp-content', dst)),
      ])
    )),
    writeFile(
      'docker-compose.yml',
      `
      version: '3.1'

      name: wp
      
      services:
        mysql:
          image: mysql:latest
          restart: always
          environment:
            MYSQL_RANDOM_ROOT_PASSWORD: OK
            MYSQL_DATABASE: ${dbname}
            MYSQL_USER: ${dbuser}
            MYSQL_PASSWORD: ${dbword}
          user: "${UID}:${GID}"
          volumes:
            - ./${dbpath}/:/var/lib/mysql/
      
        phpmyadmin:
          image: phpmyadmin:latest
          restart: always
          depends_on:
            mysql:
              condition: service_started
          ports:
            - ${dbport}:80
          environment:
            PMA_HOST: mysql
            PMA_USER: ${dbuser}
            PMA_PASSWORD: ${dbword}
      
        wordpress:
          image: wordpress:latest
          restart: always
          depends_on: 
            mysql:
              condition: service_started
          ports:
            - ${wpport}:80
          user: "${UID}:${GID}"
          volumes: [
            ./${wppath}/:/var/www/html/,
            ${wpcontent.map(([src, dst])=>`./${src}/:/var/www/html/wp-content/${dst}/`).join(', ')}
          ]
      
        wp-cli:    
          image: wordpress:cli
          depends_on:
            wordpress:
              condition: service_started
            mysql:
              condition: service_started
          user: "${UID}:${GID}"
          volumes: [
            ./${wppath}/:/var/www/html/,
            ${wpcontent.map(([src, dst])=>`./${src}/:/var/www/html/wp-content/${dst}/`).join(', ')}
          ]
    
          command: >
            /bin/sh -c '
              sleep 40
      
              wp config create\
                --dbhost=mysql\
                --dbname=${dbname}\
                --dbuser=${dbuser}\
                --dbpass=${dbword}\
                --skip-check\
      
              wp core install\
                --path="/var/www/html"\
                --url=http://localhost:${wpport}\
                --title="Some Title"\
                --admin_user=${wpuser}\
                --admin_password=${wpword}\
                --admin_email=${wpmail}\ 

              wp option update blogname "Random Blog Name"
              wp option update blogdescription "Random Blog Description"

              wp option update uploads_use_yearmonth_folders 0

              wp core update
      
              wp language core install ${wplang}
              wp language core activate ${wplang}
      
              wp plugin delete\
                akismet\
                hello\
      
              wp plugin install ${plugins.join(' ')}
      
              wp plugin update --all
              wp plugin activate --all
      
              wp theme delete\
                twentytwentyone\
                twentytwentytwo\
                twentytwentythree\
                twentytwentyfour\
                twentytwentyfive\
                twentytwentysix\
                
              wp theme install ${themes.join(' ')}
            '
      `
    ),
  ])

  const prune = ({
    wppath = 'wordpress',
    dbpath = 'database',
  }) =>
  Promise.all(
    [dbpath, wppath, 'docker-compose.yml']
    .map(path =>
      rm(path, {force: true, recursive: true})
    )
  )

export default {build, prune}