import React from 'react'
import { useQuery } from '@apollo/client'
import { ALL_BOOKS, ME } from '../queries'

const Recommended = ({ show }) => {
  const user = useQuery(ME)
  const favoriteGenre = user.data ? user.data.me.favoriteGenre : ''
  const books = useQuery(ALL_BOOKS, { variables: { genre: favoriteGenre } })

  if (!show) {
    return null
  }

  if (user.loading || books.loading) {
    return (<div>loading...</div>)
  }

console.log('user: ', user.data)
console.log('books in reco: ', books.data)

  return (
    <div>
      <h3>Username: {user.data.me.username}, your favorite genre: {user.data.me.favoriteGenre}</h3>
      <h2>Books in your favorite genre:</h2>

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
          {books.data.allBooks.map(a =>
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default Recommended