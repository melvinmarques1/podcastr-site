import { GetStaticProps } from 'next'
import Image from 'next/image'
import { format, parseISO } from 'date-fns'
import ptBr from 'date-fns/locale/pt-BR'
import { api } from '../services/api'
import { convertDurationToTimeString } from '../utils/convertDurationToTimeString'

import styles from './home.module.scss'

//Tipagem dos dados recebidos na API
type Episode = {
  id: string;
  title: string;
  members: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  durationAsString: string;
  url: string;
}

type HomeProps = {
  latestEpisodes: Episode[];
  allEpisodes: Episode[];
}

//Exibição dos dados da API, em nosso site
export default function Home({ latestEpisodes, allEpisodes }: HomeProps) {
  return (
    <div className={styles.homepage}>
    <section className={styles.latestEpisodes}>
      <h2>Ultimos lançamentos</h2>

      <ul>
        {latestEpisodes.map(episode => {
          return (
            <li key={episode.id}>
            <Image  
            width={192} 
            height={192} 
            src={episode.thumbnail} 
            alt={episode.title} 
            objectFit="cover"
            />

            <div className={styles.episodeDetails}>
              <a href="">{episode.title}</a>
              <p>{episode.members}</p>
              <span>{episode.publishedAt}</span>
              <span>{episode.durationAsString}</span>
            </div>

            <button type="button">
              <img src="./play-green.svg" alt="Tocar episódio" />
            </button>
            </li>
          )
        })}
      </ul>
    </section>

    <section className={styles.allEpisodes}>
        <h2>Todos os episódios</h2>

        <table >
          <thead>
            <th></th>
            <th>Podcast</th>
            <th>Integrantes</th>
            <th>Data</th>
            <th>Duração</th>
            <th></th>
          </thead>
          <tbody>
            {allEpisodes.map(episode => {
              return (
                <tr key={episode.id}>
                  <td style={{ width: 72 }}>
                  <Image 
                  width={120}
                  height={120}
                  src={episode.thumbnail}
                  alt={episode.title}
                  objectFit="cover"
                  />
                  </td>
                  <td>
                    <a href="">{episode.title}</a>
                  </td>
                  <td>{episode.members}</td>
                  <td style={{ width: 100 }}>{episode.publishedAt}</td>
                  <td>{episode.durationAsString}</td>
                  <td>
                    <button type="button">
                      <img src="./play-green.svg" alt="Tocar episódio" />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
    </section>
    </div>
  )
}

//Controlador de entrega do que esta no server  json para a página em SSG
export const getStaticProps: GetStaticProps = async () => {
  const { data } = await api.get('episodes', {
    params: {
      _limit: 12,
      _sort: 'published_at',
      _order: 'desc'
    }
  })
  
  //Chamada dos dados e formatação
  const episodes = data.map(episode => {
    return {
      id: episode.id,
      title: episode.title,
      thumbnail: episode.thumbnail,
      members: episode.members,
      publishedAt: format(parseISO(episode.published_at), 'd MMM yy', { locale: ptBr }),
      duration: Number(episode.file.duration),
      durationAsString: convertDurationToTimeString(Number(episode.file.duration)),
      description: episode.description,
      url: episode.file.url,
    }
  })

  //Separação dos episódios mais atuais
  const latestEpisodes = episodes.slice(0, 2);
  const allEpisodes = episodes.slice(2, episodes.lenght);

  //Retorno de todos os dados
  return {
    props: {
      latestEpisodes,
      allEpisodes,
    },
    revalidate: 60 * 60 * 8,
  }
}
