import bot from './assets/bot.svg';
import user from './assets/user.svg';

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');

let loadInterval;

const loader = (element) => {
    element.textContent = '';

    loadInterval = setInterval(() => {
        element.textContent += '.';

        if (element.textContent === '....') {
            element.textContent = '';
        }
    }, 300);
}

const typeText = (element, text, isBot = false) => {
    let index = 0;
    const interval = setInterval(() => {
        if (index < text.length) {
            element.innerHTML += text.charAt(index);
            index++;
        } else {
            clearInterval(interval);
            if (isBot) {
                // Add a booking link if the response contains a hotel recommendation
                const hotelName = extractHotelName(text); // Define this function based on your use case
                if (hotelName) {
                    const bookingLink = generateAffiliateLink(hotelName);
                    element.innerHTML += `<br><a href="${bookingLink}" target="_blank">Book Now</a>`;
                }
            }
        }
    }, 20);
}

const generateAffiliateLink = (hotelName) => {
    const affiliateId = 'your_affiliate_id'; // Replace with your actual affiliate ID
    const baseUrl = 'https://www.booking.com/hotel/';
    return `${baseUrl}${hotelName}.html?aid=${affiliateId}`;
}

// Define this function based on your specific use case
const extractHotelName = (text) => {
    // Simple regex to match a hotel name - customize this as needed
    const match = text.match(/hotel\s([^\s]+)/i);
    return match ? match[1] : null;
}

const generateUniqueId = () => {
    const timestamp = Date.now();
    const randomNumber = Math.random();
    const hexadecimalString = randomNumber.toString(16);

    return `id-${timestamp}-${hexadecimalString}`;
}

const chatStripe = (isAi, value, uniqueId) => {
    return (
        `
        <div class="wrapper ${isAi ? 'ai' : ''}">
            <div class="chat">
                <div class="profile">
                    <img 
                      src=${isAi ? bot : user} 
                      alt="${isAi ? 'bot' : 'user'}" 
                    />
                </div>
                <div class="message" id=${uniqueId}> ${value}</div>
            </div>
        </div>
    `
    )
}

const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const promptText = data.get('prompt');

    chatContainer.innerHTML += chatStripe(false, promptText);
    form.reset();

    const uniqueId = generateUniqueId();
    chatContainer.innerHTML += chatStripe(true, ' ', uniqueId);

    chatContainer.scrollTop = chatContainer.scrollHeight;

    const messageDiv = document.getElementById(uniqueId);
    loader(messageDiv);

    const response = await fetch('https://travel-plan-generator.onrender.com', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: promptText })
    });

    clearInterval(loadInterval);
    messageDiv.innerHTML = " ";

    if (response.ok) {
        const data = await response.json();
        const parsedData = data.bot.content;
        typeText(messageDiv, parsedData, true);
    } else {
        const err = await response.text();
        messageDiv.innerHTML = "Something went wrong";
        alert(err);
    }
}

form.addEventListener('submit', handleSubmit);
form.addEventListener('keyup', (e) => {
    if (e.keyCode === 13) {
        handleSubmit(e);
    }
});
