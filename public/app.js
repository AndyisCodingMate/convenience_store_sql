document.getElementById('signup-form').addEventListener('submit', async function (event) {
    event.preventDefault(); // Prevent the form from reloading the page

    // Get form data
    const firstName = document.getElementById('first-name').value;
    const lastName = document.getElementById('last-name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const userType = document.getElementById('user-type').value;

    // Prepare data for API request
    const formData = {
        firstName,
        lastName,
        email,
        password,
        userType
    };

    try {
        const response = await fetch('http://localhost:5000/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();
        
        if (response.status === 201) {
            // Success
            document.getElementById('message').textContent = 'User registered successfully!';
            document.getElementById('message').style.color = 'green';
        } else {
            // Error
            document.getElementById('message').textContent = result || 'Error signing up';
            document.getElementById('message').style.color = 'red';
        }
    } catch (error) {
        document.getElementById('message').textContent = 'Error connecting to the server';
        document.getElementById('message').style.color = 'red';
    }
});
