import React, { useState, useEffect } from 'react'
import { useQuery, useLazyQuery } from '@apollo/client'
import { ALL_BOOKS, ALL_GENRES } from '../queries'

const Books = (props) => {
  const genres = useQuery(ALL_GENRES)
  const [booksToShow, setBooksToShow] = useState([])
  const [getBooks, { loading, data }] = useLazyQuery(ALL_BOOKS)
  
  useEffect(() => {
    if (data && data.allBooks) {
      console.log('data: ', data)
      console.log('data.allBooks: ', data.allBooks)
      setBooksToShow(data.allBooks)
    }
  }, [data])
  
  if (!props.show) {
    return null
  }

  if (loading) {
    return <div>loading...</div>
  }

  return (
    <div>
      <h2>books</h2>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              author
            </th>
            <th>
              published
            </th>
          </tr>
          {booksToShow.map(a =>
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          )}
        </tbody>
      </table>
      <div>
        {genres.data.allGenres.map(g =>
          <button key={g} onClick={() => getBooks({ variables: { genre: g }, options: { fetchPolicy: 'no-cache' } })}>{g}</button>
        )}
        <button onClick={() => getBooks()}>all genres</button>
      </div>
    </div>
  )
}

export default Books