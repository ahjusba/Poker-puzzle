import axios from 'axios'

const baseUrl = '/api/hand-replayer/hand'

const fetchHandData = (handId) => {
  console.log("Fetching hand data for ID:", handId)
  return axios.get(`${baseUrl}/${handId}`)
    .then(response => response.data)
    .catch(error => {
      console.error("Error fetching hand data:", error)
      throw error
    })
}

// Export the service functions
export default { fetchHandData }