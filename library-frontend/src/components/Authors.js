  
import React, { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { ALL_AUTHORS, EDIT_AUTHOR, ALL_BOOKS } from '../queries'
//import { resultKeyNameFromField } from '@apollo/client/utilities'

/*export const ALL_AUTHORS = gql`
  query {
    allAuthors {
      name
      born
      id
      bookCount
    }
  }
`*/

const Authors = (props) => {
  const result = useQuery(ALL_AUTHORS)
  const [name, setName] = useState('')
  const [setBornTo, setSetBornTo] = useState('')

  const [ editAuthor ] = useMutation(EDIT_AUTHOR, {
    refetchQueries: [ { query: ALL_AUTHORS }, { query: ALL_BOOKS } ]
  })

  const submit = async (event) => {
    event.preventDefault()

    editAuthor({ variables: { name, setBornTo } })

    setName('')
    setSetBornTo('')
  }
  
  if (!props.show) {
    return null
  }

  if (result.loading) {
    return <div>loading</div>
  }

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              born
            </th>
            <th>
              books
            </th>
          </tr>
          {result.data.allAuthors.map(a =>
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          )}
        </tbody>
      </table>
      <div>
        <h3>Set birthyear</h3>
        <form onSubmit={submit}>
          name<input value={name} onChange={({ target }) => setName(target.value)} /><br />
          born<input value={setBornTo} onChange={({target}) => setSetBornTo(Number(target.value))} /><br />
          <button type="submit">update author</button>
        </form>
      </div>

    </div>
  )
}

export default Authors
