// Tambahkan variabel global untuk tombol "Fetch Images", "Download Images", dan "Select All"
const fetchImagesButton = document.getElementById('fetchImagesButton');
const downloadButton = document.getElementById('downloadButton');
const selectAllButton = document.getElementById('selectAllButton');
const titleImage = document.getElementById('titleImage');
let inputUrl = '';

// Function to show processing label
function showProcessingLabel() {
    const processingLabel = document.getElementById('processingLabel');
    processingLabel.style.display = 'block';
}

// Function to hide processing label
function hideProcessingLabel() {
    const processingLabel = document.getElementById('processingLabel');
    processingLabel.style.display = 'none';
}

// Function to fetch and extract the title from the provided URL using CORS Anywhere proxy
function fetchPageTitle(url, attempts = 0) {
    // CORS Anywhere proxy URL
    const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
    const maxAttempts = 3;

    // Fetch using the proxy
    return fetch(proxyUrl + url)
        .then(response => response.text())
        .then(data => {
            // Create a temporary div to hold the HTML content
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = data;

            // Select the <h3> element within the specified class
            const titleElement = tempDiv.querySelector('.col-lg-5.width-detail-title h3');
            if (titleElement) {
                return titleElement.textContent.trim(); // Return the text content of the <h3> element
            } else {
                // console.error('Element with class "col-lg-5 width-detail-title" and <h3> tag not found.');
                // If not found and we haven't reached the max attempts, try again with an updated URL
                if (attempts < maxAttempts) {
                    const newUrl = generateNewUrl(url, attempts + 1);
                    console.log('newUrl: ' + newUrl);
                    return fetchPageTitle(newUrl, attempts + 1);
                } else {
                    return null; // Return null if max attempts reached
                }
            }
        })
        .catch(error => {
            console.error('Error fetching page:', error);
            return null;
        });
}

// Function to generate a new URL with an additional suffix number
function generateNewUrl(url, suffix) {
    // Remove any trailing numbers and hyphens from the URL
    const baseUrl = url.replace(/(-\d+)?$/, '');
    return `${baseUrl}-${suffix}`;
}

// Function to fetch image links from the provided URL using CORS Anywhere proxy
function fetchImageLinks(url) {
    // CORS Anywhere proxy URL
    const proxyUrl = 'https://cors-anywhere.herokuapp.com/';

    // Fetch using the proxy
    return fetch(proxyUrl + url)
        .then(response => response.text())
        .then(data => {
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

            return imageLinks; // Return the array of image links and data-warna
        })
        .catch(error => {
            console.error('Error fetching page:', error);
            return [];
        });
}

// Function to fetch images and update the title when the button is clicked
function fetchImages() {
    let getInputFromUser = document.getElementById('inputUrl').value.trim();

    if (getInputFromUser === '') {
        alert('Masukkan link gambar atau halaman terlebih dahulu.');
        return;
    }
    
    if (!getInputFromUser.includes('http')) {
        const otherDomain = 'https://myfashiongrosir.com/dropship/produk/detail/';
        getInputFromUser = otherDomain + getInputFromUser.toLowerCase().split(' ').join('-');
    }

    inputUrl = getInputFromUser;

    // Disable and change the "Fetch Images" button color to gray
    fetchImagesButton.disabled = true;
    fetchImagesButton.style.backgroundColor = '#ccc';
    fetchImagesButton.textContent = 'Loading...'; // Change button text to "Loading..."

    // Hide the download and select all buttons
    downloadButton.style.display = 'none';
    selectAllButton.style.display = 'none';
    titleImage.style.display = 'none';

    // Show processing label
    showProcessingLabel();

    // Clear previous images
    const imageContainer = document.getElementById('imageContainer');
    imageContainer.innerHTML = '';

    // Fetch images and title in parallel
    Promise.all([
        fetchImageLinks(inputUrl),
        fetchPageTitle(inputUrl)
    ]).then(([imageLinks, pageTitle]) => {
        if (imageLinks.length > 0) {
            downloadButton.style.display = 'block';
            selectAllButton.style.display = 'block';
            selectAllButton.textContent = 'Select All';
        } else {
            console.log('Tidak ada foto yang tersedia');
            alert('Tidak ada foto yang tersedia');
        }

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

        // Hide processing label after fetching is complete
        hideProcessingLabel();

        // Enable the "Fetch Images" button after the process is complete
        fetchImagesButton.disabled = false;
        fetchImagesButton.style.backgroundColor = '#007bff';
        fetchImagesButton.textContent = 'Fetch Images'; // Restore button text

        // Update the titleImage element with the fetched title
        const titleImage = document.getElementById('titleImage');
        if (pageTitle) {
            titleImage.textContent = pageTitle;
            titleImage.style.display = 'block'; // Ensure the titleImage element is visible
        }
    });
}

// Function to toggle select all images
function toggleSelectAll() {
    const checkboxes = document.querySelectorAll('#imageContainer input[type="checkbox"]');
    const selectAllButton = document.getElementById('selectAllButton');

    if (selectAllButton.textContent === 'Select All') {
        checkboxes.forEach(checkbox => {
            checkbox.checked = true;
        });
        selectAllButton.textContent = 'Deselect';
    } else {
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        selectAllButton.textContent = 'Select All';
    }
}

// Function to get a sanitized file name from URL
function getFileNameFromUrl(url) {
    // Extract the part after the last '/' and before any query parameters or fragment
    let fileName = url.split('/').pop().split('?')[0].split('#')[0];
    // Remove any invalid characters for file names and return a default name if empty
    fileName = fileName.replace(/[^a-zA-Z0-9_-]/g, '') || 'images';
    return fileName;
}

// Function to download selected images as ZIP
function downloadImages() {
    // Disable and change the "Download Images" button color to gray
    downloadButton.disabled = true;
    downloadButton.style.backgroundColor = '#ccc';
    downloadButton.textContent = 'Loading...'; // Change button text to "Loading..."

    const imageContainer = document.getElementById('imageContainer');
    const checkboxes = imageContainer.querySelectorAll('input[type="checkbox"]:checked');

    if (checkboxes.length === 0) {
        alert('Tidak ada gambar yang dipilih untuk diunduh.');
        // Restore the "Download Images" button to its original state
        downloadButton.disabled = false;
        downloadButton.style.backgroundColor = '#007bff';
        downloadButton.textContent = 'Download Images';
        return;
    }

    // Fetch the input URL from the input field
    const inputUrl = document.getElementById('inputUrl').value.trim();
    const fileName = getFileNameFromUrl(inputUrl); // Get the file name based on the URL

    const zip = new JSZip();
    const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
    const promises = [];
    const fileNameZip = document.getElementById('titleImage').innerText;

    checkboxes.forEach((checkbox, index) => {
        const url = checkbox.dataset.link;
        const color = checkbox.dataset.color;
        const filename = `${index + 1}. ${color} - ${fileNameZip}.jpg`;
        const promise = fetch(proxyUrl + url)
            .then(response => response.blob())
            .then(blob => {
                zip.file(filename, blob);
            });

        promises.push(promise);
    });

    Promise.all(promises).then(() => {
        zip.generateAsync({ type: 'blob' }).then(content => {
            saveAs(content, `${fileNameZip}.zip`); // Use the extracted name for ZIP
            // Restore the "Download Images" button to its original state
            downloadButton.disabled = false;
            downloadButton.style.backgroundColor = '#007bff';
            downloadButton.textContent = 'Download Images';
        });
    });
}