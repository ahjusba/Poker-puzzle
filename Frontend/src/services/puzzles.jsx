import axios from 'axios'

// const url = 'http://localhost:3001/api/buttons'
const url = '/api/puzzles'

const getAll = () => {
  console.log("GET all from " + url)
  return axios.get(url)
          .then(response => response.data)
}

const getId = (id) => {
  console.log("GET id from " + `${url}/${id}`)
  return axios.get(`${url}/${id}`)
          .then(response => response.data)
}

const vote = (id, voteId) => {
  console.log(`id: ${id} vodeId: ${voteId}`)
  return axios.put(`${url}/${id}/vote`, { voteId: voteId })
          .then(response => response.data)          
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

export default { getAll, getId, vote }