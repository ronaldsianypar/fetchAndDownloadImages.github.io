function detectDevice() {
    var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
        document.getElementById('alertModal').style.display = 'none';
        showAlertModal("Use desktop mode and refresh this page after that");
    }
}

window.onload = detectDevice;

// Tambahkan variabel global untuk tombol "Fetch Images", "Download Images", dan "Select All"
const fetchImagesButton = document.getElementById('fetchImagesButton');
const downloadButton = document.getElementById('downloadButton');
const copyDescriptionButton = document.getElementById('copyDescriptionButton');
const selectAllButton = document.getElementById('selectAllButton');
const titleImage = document.getElementById('titleImage');
const alertCopyUrl = document.getElementById('alertCopyUrl');
let inputUrl = '';

// Function to generate a new URL with an additional suffix number
function generateNewUrl(url, suffix) {
    // Remove any trailing numbers and hyphens from the URL
    const baseUrl = url.replace(/(-\d+)?$/, '');
    return `${baseUrl}-${suffix}`;
}

// Function to show the custom alert modal
function showAlertModal(message) {
    document.getElementById('alertMessage').textContent = message;
    document.getElementById('alertModal').style.display = 'flex';

    // Automatically hide the modal when clicking the OK button
    document.getElementById('alertOkButton').addEventListener('click', () => {
        document.getElementById('alertModal').style.display = 'none';
        alertCopyUrl.style.display = 'none';
    });
}

// Function to fetch image links from the provided URL using CORS Anywhere proxy
async function fetchImageLinks(url) {
    // CORS Anywhere proxy URL
    const proxyUrl = 'https://cors-anywhere.herokuapp.com/';

    try {
        const response = await fetch(proxyUrl + url);
        if (response.ok) {
            const data = await response.text();

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

            // Extract description
            const descriptionElement = tempDiv.querySelector('.text-desc'); // Update the selector if needed
            const descriptionText = descriptionElement ? descriptionElement.textContent.trim() : '';

            // Set description in the textarea
            document.querySelector('.text-desc').textContent = descriptionText;

            // Extract image
            const titleImageElement = tempDiv.querySelector('.width-detail-title .font-poppins'); // Update the selector if needed
            const titleImageText = titleImageElement ? titleImageElement.textContent.trim() : '';

            // Set titleImage in the textarea
            document.querySelector('#titleImage').textContent = titleImageText;

            return imageLinks; // Return the array of image links and data-warna
        } else {
            console.log("Proxy URL returned an error fetchImageLinks:", response.status, response.statusText);
            return [];
        }
    } catch (error) {
        console.error("Error fetching page fetchImageLinks:", error);
        return [];
    }

    // Fetch using the proxy
    // return fetch(proxyUrl + url)
    //     .then(response => response.text())
    //     .then(data => {
            
    //     })
    //     .catch(error => {
    //         console.error('Error fetching page:', error);
    //         return [];
    //     });
}

// Function to fetch images and update the title when the button is clicked
function fetchImages() {
    var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
        showAlertModal("Use desktop mode and refresh this page after that");
    } else {
        let getInputFromUser = document.getElementById('inputUrl').value.trim();

        if (getInputFromUser === '') {
            showAlertModal('Enter an image or page link first.');
            return;
        }
        
        if (!getInputFromUser.includes('http')) {
            const otherDomain = 'https://myfashiongrosir.com/dropship/produk/detail/';
            getInputFromUser = otherDomain + getInputFromUser.toLowerCase().split(' ').join('-');
        }

        inputUrl = getInputFromUser;

        // Disable and change the "Fetch Images" button color to gray
        fetchImagesButton.disabled = true;
        fetchImagesButton.style.backgroundColor = '#FFC107';

        let secondsElapsed = 0;

        // Function to update button text with elapsed time
        const updateLoadingText = () => {
            secondsElapsed++;
            fetchImagesButton.textContent = `Loading (${secondsElapsed}s)`;
        };

        // Start updating loading text every second
        const intervalId = setInterval(updateLoadingText, 1000);

        // Hide the download and select all buttons
        downloadButton.style.display = 'none';
        copyDescriptionButton.style.display = 'none';
        selectAllButton.style.display = 'none';
        titleImage.style.display = 'none';

        // Clear previous images
        const imageContainer = document.getElementById('imageContainer');
        imageContainer.innerHTML = '';

        // Fetch images and title in parallel
        Promise.all([
            fetchImageLinks(inputUrl),
            // fetchPageTitle(inputUrl)
        ]).then(([imageLinks, pageTitle]) => {
            if (imageLinks.length > 0) {
                downloadButton.style.display = 'block';
                copyDescriptionButton.style.display = 'block';
                selectAllButton.style.display = 'block';
                selectAllButton.textContent = 'Select All';
                titleImage.style.display = 'block';
            } else {
                const originalConsoleLog = console.log;
                const logs = [];

                console.log = function(message) {
                    logs.push(message);
                    originalConsoleLog.apply(console, arguments);
                };

                function checkForError() {
                    if (logs.some(log => log.includes("Proxy URL returned an error fetchImageLinks: 403 Forbidden"))) {
                        showAlertModal('Open https://cors-anywhere.herokuapp.com/corsdemo or you are limited to 50 fetch images/hour');
                        alertCopyUrl.style.display = 'block';
                    } else {
                        showAlertModal('URL Not Found');
                    }
                }
                // Simulasi log untuk pengujian
                console.log("Proxy URL returned an error fetchImageLinks: 403 Forbidden"); // Ganti ini dengan log asli
                checkForError();
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

            // Enable the "Fetch Images" button after the process is complete
            fetchImagesButton.disabled = false;
            fetchImagesButton.style.backgroundColor = '#007bff';
            fetchImagesButton.textContent = 'Fetch Images'; // Restore button text

            // Clear the loading interval
            clearInterval(intervalId);
        });
    }
}

// Function to toggle select all images
function toggleSelectAll() {
    const checkboxes = document.querySelectorAll('#imageContainer input[type="checkbox"]');
    const selectAllButton = document.getElementById('selectAllButton');

    if (selectAllButton.textContent === 'Select All') {
        checkboxes.forEach(checkbox => {
            checkbox.checked = true;
        });
        selectAllButton.textContent = 'Deselect All';
        selectAllButton.style.backgroundColor = '#FFC107';
    } else {
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        selectAllButton.textContent = 'Select All';
        selectAllButton.style.backgroundColor = '#007bff';
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
    downloadButton.style.backgroundColor = '#FFC107';

    let secondsElapsed = 0;

    // Function to update button text with elapsed time
    const updateLoadingText = () => {
        secondsElapsed++;
        downloadButton.textContent = `Downloading (${secondsElapsed}s)`;
    };

    // Start updating loading text every second
    const intervalId = setInterval(updateLoadingText, 1000);

    const imageContainer = document.getElementById('imageContainer');
    const checkboxes = imageContainer.querySelectorAll('input[type="checkbox"]:checked');

    if (checkboxes.length === 0) {
        showAlertModal('No images selected for download.');
        // Restore the "Download Images" button to its original state
        downloadButton.disabled = false;
        downloadButton.style.backgroundColor = '#007bff';
        downloadButton.textContent = 'Download Images';
        clearInterval(intervalId); // Clear the interval if no images are selected
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

            // Clear the loading interval
            clearInterval(intervalId);
        });
    }).catch(err => {
        console.error('Failed to download images: ', err);

        // Restore the "Download Images" button to its original state if an error occurs
        downloadButton.disabled = false;
        downloadButton.style.backgroundColor = '#007bff';
        downloadButton.textContent = 'Download Images';

        // Clear the loading interval
        clearInterval(intervalId);
    });
}

function copyDescription() {
    const hiddenTextarea = document.querySelector('.text-desc');
    const copyButton = document.getElementById('copyDescriptionButton'); // Update with the correct button ID

    if (hiddenTextarea && copyButton) {
        navigator.clipboard.writeText(hiddenTextarea.textContent)
            .then(() => {
                // Add the 'copied' class to change button background color
                copyButton.textContent = 'Copied!';
                copyButton.classList.add('copied');

                // Revert button text and background color back to original after 2 seconds
                setTimeout(() => {
                    copyButton.textContent = 'Copy Description';
                    copyButton.classList.remove('copied'); // Remove the 'copied' class
                }, 2000); // Adjust the duration as needed
            })
            .catch(err => {
                console.error('Failed to copy text: ', err);
                // Optionally handle errors here
            });
    } else {
        // Optionally handle cases where the textarea or button is not found
    }
}

function clearInputUrl() {
    document.getElementById('inputUrl').value = '';
}