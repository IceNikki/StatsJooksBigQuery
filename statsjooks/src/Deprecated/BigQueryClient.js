const firebaseFunctionsBaseUrl = 'https://us-central1-statsjooks-e80dd.cloudfunctions.net/api';

export async function fetchBigQueryData({ startDate, endDate, routeId = '', routeName = '', cityId = '', cityName = '' }) {
  try {
    console.log('Sending fetch request with:', { startDate, endDate, routeId, routeName, cityId, cityName });
    const response = await fetch(`${firebaseFunctionsBaseUrl}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ startDate, endDate, routeId, routeName, cityId, cityName }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    console.log('Received response:', data);
    return data;
  } catch (error) {
    console.error('Error fetching BigQuery data:', error);
    return [];
  }
}

export async function fetchStatsData({ startDate, endDate, city }) {
  try {
    console.log('Sending fetch request for Stats with:', { startDate, endDate, city });
    const response = await fetch(`${firebaseFunctionsBaseUrl}/query-stats`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ startDate, endDate, city }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    console.log('Received response:', data);
    return data;
  } catch (error) {
    console.error('Error fetching Stats data:', error);
    return [];
  }
}
