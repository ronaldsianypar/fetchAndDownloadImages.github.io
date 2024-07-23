async function fetchSourceCode(url) {
    try {
        const proxyUrl = 'https://api.allorigins.win/get?url=';
        const response = await fetch(proxyUrl + encodeURIComponent(url));
        if (!response.ok) {
            showAlertModal('Network response was not ok');
            throw new Error('Network response was not ok');
        }
        const getResponse = await response.json();
        const data = getResponse.contents;

        // Create a temporary div to hold the HTML content
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = data;

        // Select all slides within the modal with class 'mySlides'
        const slides = tempDiv.querySelectorAll('#myModal .modal-content .mySlides');

        // Array to store image links and corresponding data-warna
        let imageLinks = [];

        // Iterate through each slide and extract the src attribute and data-warna
        slides.forEach((slide, index) => {
            let img = slide.querySelector('.card-img-top');
            let src = img ? img.getAttribute('src') : '';
            let warna = slide.getAttribute('data-warna');
            if (src && src.startsWith('http')) {
                // Push the src link and data-warna to the array
                imageLinks.push({ src, warna });
            }
        });

        console.log('SUCCESS fetchSourceCode');

        return imageLinks; // Return the array of image links and data-warna
    } catch (error) {
        // document.getElementById('sourceCode').textContent = 'Failed to load source code.';
        console.error('Error fetching source code:', error);
    }
}

function fetchImages2() {
    let getInputFromUser = document.getElementById('inputUrl').value.trim();

    if (getInputFromUser === '') {
        showAlertModal('Enter an image or page link first.');
        return;
    }

    Promise.all([
        fetchSourceCode(getInputFromUser),
    ]).then(([imageLinks, pageTitle]) => {
        // Clear previous content in imageContainer
        imageContainer.innerHTML = '';

        // Create Bootstrap row div
        const rowDiv = document.createElement('div');
        rowDiv.classList.add('row', 'row-cols-2', 'row-cols-md-6', 'g-4');

        imageLinks.forEach((linkObj, index) => {
            const { src, warna } = linkObj;
            console.log(`${index + 1}. ${src}`);

            // Create Bootstrap col div
            const colDiv = document.createElement('div');
            colDiv.classList.add('col');

            // Create card div
            const cardDiv = document.createElement('div');
            cardDiv.classList.add('card', 'h-100');

            // Create image item container
            const imageItem = document.createElement('div');
            imageItem.classList.add('image-item');

            // Create and display the image
            const imgElement = document.createElement('img');
            imgElement.src = src;
            imgElement.alt = `Image ${index + 1}`;
            imgElement.classList.add('card-img-top');
            imageItem.appendChild(imgElement);

            // Create and display the card title
            const cardTitle = document.createElement('h6');
            cardTitle.classList.add('card-title');
            cardTitle.style.marginLeft = '6px';
            cardTitle.style.marginTop = '6px';
            cardTitle.textContent = `${index + 1}. ${warna}`;
            imageItem.appendChild(cardTitle);

            // Create and display the checkbox
            const checkboxContainer = document.createElement('div');
            checkboxContainer.classList.add('checkbox-container');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.dataset.link = src;
            checkbox.dataset.color = warna;
            checkboxContainer.appendChild(checkbox);
            imageItem.appendChild(checkboxContainer);

            // Append image item to card and card to col
            cardDiv.appendChild(imageItem);
            colDiv.appendChild(cardDiv);

            // Append col to row
            rowDiv.appendChild(colDiv);

            // Add click event to imgElement to toggle the checkbox
            imgElement.addEventListener('click', () => {
                checkbox.checked = !checkbox.checked;
            });
        });

        // Append row to imageContainer
        imageContainer.appendChild(rowDiv);

        // Enable the "Fetch Images" button after the process is complete
        fetchImagesButton.disabled = false;
        fetchImagesButton.style.backgroundColor = '#007bff';
        fetchImagesButton.textContent = 'Fetch Images'; // Restore button text

        // Clear the loading interval
        // clearInterval(intervalId);
    });
}