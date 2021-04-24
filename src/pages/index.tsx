import { GetStaticProps } from 'next'
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
  published_at: string;
  duration: string;
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
            <a href="">{episode.title}</a>
            </li>
          )
        })}
      </ul>
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
