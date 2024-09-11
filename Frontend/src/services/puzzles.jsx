import axios from 'axios'
const url = '/api/puzzles'

const getLatest = () => {
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

const submit = (handJson) => {
  console.log("POSTing handJson to ", url, "with data: ", handJson)
  return axios.post(url, handJson)
    .then(response => response.data)
    .catch(error => {
      console.error("Error submitting data to the database", error)
      throw error
    })
}

export default { getLatest, getId, vote, submit }