import { useState, useEffect } from 'react';
import axios from 'axios';

export function App() {
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const hello = async () => {
      try {
        await axios.get(`${process.env.SERVER_URL}/message`).then((data) => {
          console.log('response status:', data.status);
          setMessage(data.data.message);
        });
      } catch (error) {
        console.error(error);
      }
    };
    hello();
  }, []);

  return <h1>{message}</h1>;
}
