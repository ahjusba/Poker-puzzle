import axios from 'axios'

// const url = 'http://localhost:3001/api/buttons'
const url = '/api/buttons'

const getAll = () => {
  console.log("getting from " + url)
  const request = axios.get(url)
  return request.then(response => response.data)
}

// const update = (id, button) => {
//   return axios
//     .put(`${url}/${id}`, button)
//     .then(response => response.data)    
// }

// const add = (button) => {
//   return axios
//     .post(`${url}`, button)
//     .then(response => response.data)
// }

// const remove = (id) => {
//   return axios
//     .delete(`${url}/${id}`)
// }

export default { getAll }