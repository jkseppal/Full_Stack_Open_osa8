  
import React, { useState } from 'react'
import Select from 'react-select'
import { useQuery, useMutation } from '@apollo/client'
import { ALL_AUTHORS, EDIT_AUTHOR, ALL_BOOKS } from '../queries'

const Authors = ({ show, token }) => {
  const result = useQuery(ALL_AUTHORS)
  const [name, setName] = useState('')
  const [setBornTo, setSetBornTo] = useState('')
  const [selected, setSelected] = useState(null)

  const [ editAuthor ] = useMutation(EDIT_AUTHOR, {
    refetchQueries: [ { query: ALL_AUTHORS }, { query: ALL_BOOKS } ]
  })

  const submit = async (event) => {
    event.preventDefault()

    editAuthor({ variables: { name, setBornTo } })

    setName('')
    setSetBornTo('')
  }

  const handleSelectionChange = (selected) => {
    setSelected(selected)
    setName(selected.value)
  }

  let options = result.data && result.data.allAuthors.map(a => {
    return { value: a.name, label: a.name}
  })
  
  if (!show) {
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
      {token && <div>
        <h3>Set birthyear</h3>
        <form onSubmit={submit}>
          <Select
            value={selected}
            onChange={handleSelectionChange}
            options={options}
          />
          born<input value={setBornTo} onChange={({target}) => setSetBornTo(Number(target.value))} /><br />
          <button type="submit">update author</button>
        </form>
      </div>}

    </div>
  )
}

export default Authors
