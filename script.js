// Tambahkan variabel global untuk tombol "Fetch Images", "Download Images", dan "Select All"
const fetchImagesButton = document.getElementById('fetchImagesButton');
const downloadButton = document.getElementById('downloadButton');
const selectAllButton = document.getElementById('selectAllButton');
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

            // Select all images within the container
            const images = tempDiv.querySelectorAll('.owl-carousel.owl-theme .item img');

            // Array to store image links
            let imageLinks = [];

            // Iterate through each image and extract the src attribute
            images.forEach((img) => {
                let src = img.getAttribute('src');
                if (src && src.startsWith('http')) {
                    // Push the src link to the array
                    imageLinks.push(src);
                }
            });

            return imageLinks; // Return the array of image links
        })
        .catch(error => {
            console.error('Error fetching page:', error);
            return [];
        });
}

// Function to fetch images when button is clicked
function fetchImages() {
    inputUrl = document.getElementById('inputUrl').value.trim();

    if (inputUrl === '') {
        alert('Masukkan link gambar atau halaman terlebih dahulu.');
        return;
    }

    // Disable dan ubah warna tombol "Fetch Images" menjadi abu-abu
    fetchImagesButton.disabled = true;
    fetchImagesButton.style.backgroundColor = '#ccc';
    fetchImagesButton.textContent = 'Loading...'; // Ubah teks tombol menjadi "Loading..."

    // Show processing label
    showProcessingLabel();

    // Clear previous images
    const imageContainer = document.getElementById('imageContainer');
    imageContainer.innerHTML = '';

    // Fetch image links and display them
    // fetchImageLinks(inputUrl).then(imageLinks => {
    //     if (imageLinks.length > 0) {
    //         downloadButton.style.display = 'block';

    //         selectAllButton.style.display = 'block';
    //         selectAllButton.textContent = 'Select All';
    //     }

    //     imageLinks.forEach((link, index) => {
    //         console.log(`${index + 1}. ${link}`);

    //         // Create image item container
    //         const imageItem = document.createElement('div');
    //         imageItem.classList.add('image-item');

    //         // Create and display the image
    //         const imgElement = document.createElement('img');
    //         imgElement.src = link;
    //         imgElement.alt = `Image ${index + 1}`;
    //         imageItem.appendChild(imgElement);

    //         // Create and display the checkbox
    //         const checkboxContainer = document.createElement('div');
    //         checkboxContainer.classList.add('checkbox-container');
    //         const checkbox = document.createElement('input');
    //         checkbox.type = 'checkbox';
    //         checkbox.dataset.link = link;
    //         checkboxContainer.appendChild(checkbox);
    //         imageItem.appendChild(checkboxContainer);

    //         // Add the image item to the container
    //         imageContainer.appendChild(imageItem);
    //     });

    //     // Hide processing label after fetching is complete
    //     hideProcessingLabel();

    //     // Enable kembali tombol "Fetch Images" setelah proses selesai
    //     fetchImagesButton.disabled = false;
    //     fetchImagesButton.style.backgroundColor = '#007bff';
    //     fetchImagesButton.textContent = 'Fetch Images'; // Kembalikan teks tombol ke semula
    // });

    fetchImageLinks(inputUrl).then(imageLinks => {
        if (imageLinks.length > 0) {
            downloadButton.style.display = 'block';
            selectAllButton.style.display = 'block';
            selectAllButton.textContent = 'Select All';
        }
    
        // Clear previous content in imageContainer
        imageContainer.innerHTML = '';
    
        // Create Bootstrap row div
        const rowDiv = document.createElement('div');
        rowDiv.classList.add('row', 'row-cols-2', 'row-cols-md-6', 'g-4');
    
        imageLinks.forEach((link, index) => {
            console.log(`${index + 1}. ${link}`);
    
            // Create Bootstrap col div
            const colDiv = document.createElement('div');
            colDiv.classList.add('col');
    
            // Create card div
            const cardDiv = document.createElement('div');
            cardDiv.classList.add('card');
    
            // Create image item container
            const imageItem = document.createElement('div');
            imageItem.classList.add('image-item');
    
            // Create and display the image
            const imgElement = document.createElement('img');
            imgElement.src = link;
            imgElement.alt = `Image ${index + 1}`;
            imgElement.classList.add('card-img-top');
            imageItem.appendChild(imgElement);
    
            // Create and display the checkbox
            const checkboxContainer = document.createElement('div');
            checkboxContainer.classList.add('checkbox-container');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.dataset.link = link;
            checkboxContainer.appendChild(checkbox);
            imageItem.appendChild(checkboxContainer);
    
            // Append image item to card and card to col
            cardDiv.appendChild(imageItem);
            colDiv.appendChild(cardDiv);
    
            // Append col to row
            rowDiv.appendChild(colDiv);
        });
    
        // Append row to imageContainer
        imageContainer.appendChild(rowDiv);
    
        // Hide processing label after fetching is complete
        hideProcessingLabel();
    
        // Enable the "Fetch Images" button after the process is complete
        fetchImagesButton.disabled = false;
        fetchImagesButton.style.backgroundColor = '#007bff';
        fetchImagesButton.textContent = 'Fetch Images'; // Restore button text
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
        selectAllButton.textContent = 'Disselect';
    } else {
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        selectAllButton.textContent = 'Select All';
    }
}

// Function to download selected images as ZIP
function downloadImages() {
    // Disable dan ubah warna tombol "Download Images" menjadi abu-abu
    downloadButton.disabled = true;
    downloadButton.style.backgroundColor = '#ccc';
    downloadButton.textContent = 'Loading...'; // Ubah teks tombol menjadi "Loading..."

    const imageContainer = document.getElementById('imageContainer');
    const checkboxes = imageContainer.querySelectorAll('input[type="checkbox"]:checked');

    if (checkboxes.length === 0) {
        alert('Tidak ada gambar yang dipilih untuk diunduh.');
        // Kembalikan tombol "Download Images" ke kondisi semula
        downloadButton.disabled = false;
        downloadButton.style.backgroundColor = '#007bff';
        downloadButton.textContent = 'Download Images';
        return;
    }

    const zip = new JSZip();
    const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
    const promises = [];

    checkboxes.forEach((checkbox, index) => {
        const url = checkbox.dataset.link;
        const filename = `image${index + 1}.jpg`;

        const promise = fetch(proxyUrl + url)
            .then(response => response.blob())
            .then(blob => {
                zip.file(filename, blob);
            });

        promises.push(promise);
    });

    Promise.all(promises).then(() => {
        zip.generateAsync({ type: 'blob' }).then(content => {
            const fileName = getFileNameFromUrl(inputUrl); // Ambil nama file dari inputUrl
            saveAs(content, `${fileName}.zip`); // Gunakan nama file untuk ZIP
            // Kembalikan tombol "Download Images" ke kondisi semula
            downloadButton.disabled = false;
            downloadButton.style.backgroundColor = '#007bff';
            downloadButton.textContent = 'Download Images';
        });
    });
}

// Function to get file name from URL
function getFileNameFromUrl(url) {
    // Menggunakan metode sederhana untuk mengambil bagian setelah tanda "/" terakhir
    return url.substring(url.lastIndexOf('/') + 1);
}