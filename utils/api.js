import axios from 'axios';

const API_KEY = 'AIzaSyCx8Ahi-nDiygHMvyeeszBKTc7tu1568MI';

export async function getRoute(origin, destination, mode) {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&mode=${mode}&key=${API_KEY}`
    );

    if (response.data.status === 'OK') {
      const route = response.data.routes[0];
      const distance = route.legs[0].distance.text; 
      const duration = route.legs[0].duration.text; 
      const steps = route.legs[0].steps; 

      return { distance, duration, steps };
    } else {
      console.error('Erro na API:', response.data.status);
      return null;
    }
  } catch (error) {
    console.error('Erro ao buscar rota:', error);
    return null;
  }
}