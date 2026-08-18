const test = async () => {
  try {
    const response = await fetch('http://localhost:5003/test');
    console.log('Status:', response.status);
  } catch (error) {
    console.error('Fetch error:', error);
  }
};
test();
