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

        // Extract description
        const descriptionElement = tempDiv.querySelector('.text-desc');
        const descriptionText = descriptionElement ? descriptionElement.textContent.trim() : '';

        // Extract image
        const titleImageElement = tempDiv.querySelector('.width-detail-title .font-poppins');
        const titleImageText = titleImageElement ? titleImageElement.textContent.trim() : '';

        document.querySelector('.text-desc').textContent = descriptionText;
        document.querySelector('#titleImage').textContent = titleImageText;

        // Extract stock data
        const stockData = [];
        const stockContainers = tempDiv.querySelectorAll('.tab-content .produk-stok');

        stockContainers.forEach(container => {
            const size = container.classList.contains('produk-stok-XL') ? 'XL' : 'XXL';
            const rows = container.querySelectorAll('.row');
            rows.forEach(row => {
                const colorElem = row.querySelector('.text-varian-judul');
                const stockElem = row.querySelector('.text-varian-desk');
                if (colorElem && stockElem) {
                    const color = colorElem.textContent.trim();
                    const stock = stockElem.textContent.trim();
                    stockData.push({ size, color, stock });
                }
            });
        });

        return { imageLinks, stockData }; // Return the array of image links and stock data
    } catch (error) {
        console.error('Error fetching source code:', error);
        return { imageLinks: [], stockData: [] }; // Return empty arrays on error
    }
}

function generateStockTable(container, stockData) {
    container.innerHTML = ''; // Clear previous content

    // Group by size
    const sizes = [...new Set(stockData.map(item => item.size))];
    sizes.forEach(size => {
        const sizeData = stockData.filter(item => item.size === size);
        if (sizeData.length > 0) {
            const table = document.createElement('table');
            table.classList.add('table', 'table-striped');
            
            const thead = document.createElement('thead');
            const tbody = document.createElement('tbody');
            
            const headerRow = document.createElement('tr');
            const headerColor = document.createElement('th');
            headerColor.textContent = 'Warna';
            const headerStock = document.createElement('th');
            headerStock.textContent = 'Stok Tersedia';
            
            headerRow.appendChild(headerColor);
            headerRow.appendChild(headerStock);
            thead.appendChild(headerRow);
            
            sizeData.forEach(stock => {
                const row = document.createElement('tr');
                const colorCell = document.createElement('td');
                colorCell.textContent = stock.color;
                const stockCell = document.createElement('td');
                stockCell.textContent = stock.stock;
                row.appendChild(colorCell);
                row.appendChild(stockCell);
                tbody.appendChild(row);
            });
            
            table.appendChild(thead);
            table.appendChild(tbody);
            
            const tableTitle = document.createElement('h4');
            tableTitle.textContent = `Size ${size}`;
            
            container.appendChild(tableTitle);
            container.appendChild(table);
        }
    });
}

function fetchImages2() {
    let getInputFromUser = document.getElementById('inputUrl').value.trim();

    if (getInputFromUser === '') {
        showAlertModal('Enter an image or page link first.');
        return;
    }

    fetchImagesButton.disabled = true;
    fetchImagesButton.style.backgroundColor = '#FFC107';

    let secondsElapsed = 0;

    const updateLoadingText = () => {
        secondsElapsed++;
        fetchImagesButton.textContent = `Loading (${secondsElapsed}s)`;
    };

    const intervalId = setInterval(updateLoadingText, 1000);

    downloadButton.style.display = 'none';
    copyDescriptionButton.style.display = 'none';
    selectAllButton.style.display = 'none';
    titleImage.style.display = 'none';
    idexportToSheet.style.display = 'none';

    const imageContainer = document.getElementById('imageContainer');
    imageContainer.innerHTML = '';

    const tableStokContainer = document.getElementById('tableStokContainer');
    tableStokContainer.innerHTML = '';

    fetchSourceCode(getInputFromUser).then(({ imageLinks, stockData }) => {
        if (!Array.isArray(imageLinks) || !Array.isArray(stockData)) {
            console.error('Invalid data received:', { imageLinks, stockData });
            return;
        }

        if (imageLinks.length > 0) {
            downloadButton.style.display = 'block';
            copyDescriptionButton.style.display = 'block';
            selectAllButton.style.display = 'block';
            selectAllButton.textContent = 'Select All';
            titleImage.style.display = 'block';
            idexportToSheet.style.display = 'block';
        } else {
            showAlertModal('No images found.');
        }

        // Create Bootstrap row div for images
        const rowDiv = document.createElement('div');
        rowDiv.classList.add('row', 'row-cols-2', 'row-cols-md-6', 'g-4');

        const getTitleImage = document.getElementById('titleImage').innerText;

        imageLinks.forEach((linkObj, index) => {
            const { src, warna } = linkObj;
            console.log(`${index + 1}. ${src}`);

            const colDiv = document.createElement('div');
            colDiv.classList.add('col');

            const cardDiv = document.createElement('div');
            cardDiv.classList.add('card', 'h-100');

            const imageItem = document.createElement('div');
            imageItem.classList.add('image-item');

            const imgElement = document.createElement('img');
            imgElement.src = src;
            imgElement.alt = `${warna} - ${getTitleImage}`;
            imgElement.classList.add('card-img-top');
            imageItem.appendChild(imgElement);

            const cardTitle = document.createElement('h6');
            cardTitle.classList.add('card-title');
            cardTitle.style.marginLeft = '6px';
            cardTitle.style.marginTop = '6px';
            cardTitle.textContent = `${index + 1}. ${warna}`;
            imageItem.appendChild(cardTitle);

            const checkboxContainer = document.createElement('div');
            checkboxContainer.classList.add('checkbox-container');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.dataset.link = src;
            checkbox.dataset.color = warna;
            checkboxContainer.appendChild(checkbox);
            imageItem.appendChild(checkboxContainer);

            cardDiv.appendChild(imageItem);
            colDiv.appendChild(cardDiv);

            rowDiv.appendChild(colDiv);

            imgElement.addEventListener('click', () => {
                checkbox.checked = !checkbox.checked;
            });
        });

        imageContainer.appendChild(rowDiv);

        // Generate and display stock tables
        generateStockTable(tableStokContainer, stockData);

        fetchImagesButton.disabled = false;
        fetchImagesButton.style.backgroundColor = '#007bff';
        fetchImagesButton.textContent = 'Fetch Images';

        clearInterval(intervalId);
    }).catch(error => {
        console.error('Error fetching or processing data:', error);
        fetchImagesButton.disabled = false;
        fetchImagesButton.style.backgroundColor = '#007bff';
        fetchImagesButton.textContent = 'Fetch Images';
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
                showAlertModal('Failed to copy text: ', err);
            });
    }
}

async function downloadImages() {
    // Disable and change the "Download Images" button color to gray
    const downloadButton = document.getElementById('downloadButton');
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
    const fileNameZip = document.getElementById('titleImage').innerText;

    // Function to fetch image and add to zip
    const fetchImage = async (url, filename) => {
        const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
        try {
            const response = await fetch(proxyUrl + url);
            if (response.status === 429) {
                throw new Error('Too Many Requests');
            }
            const blob = await response.blob();
            const file = new File([blob], filename, { type: blob.type });
            zip.file(filename, file);
        } catch (error) {
            if (error.message === 'Too Many Requests') {
                // showAlertModal('CORS Anywhere limit reached. Please wait and try again later.');
                showAlertModal('1. Failed to download images. Make sure CORS Anywhere is running.');
            } else {
                showAlertModal('2. Failed to download images. Make sure CORS Anywhere is running.');
            }
            // Restore the "Download Images" button to its original state
            downloadButton.disabled = false;
            downloadButton.style.backgroundColor = '#007bff';
            downloadButton.textContent = 'Download Images';
            clearInterval(intervalId);
            throw error; // Re-throw the error to stop further execution
        }
    };

    const fetchPromises = [];

    checkboxes.forEach((checkbox, index) => {
        const url = checkbox.dataset.link;
        const color = checkbox.dataset.color;
        const filename = `${index + 1}. ${color} - ${fileNameZip}.jpg`;
        fetchPromises.push(fetchImage(url, filename));
    });

    // Wait for all images to be fetched
    try {
        await Promise.all(fetchPromises);

        // Generate zip file and trigger download
        zip.generateAsync({ type: 'blob' }).then((blob) => {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${fileNameZip}.zip`;
            document.body.appendChild(link);
            link.click();
            link.remove();

            // Restore the "Download Images" button to its original state
            downloadButton.disabled = false;
            downloadButton.style.backgroundColor = '#007bff';
            downloadButton.textContent = 'Download Images';
            clearInterval(intervalId);
        });
    } catch (error) {
        console.error('Error fetching images:', error);
        // The button state and alert are already handled in fetchImage
    }
}

function getFormattedDateTime() {
    const months = [
        'JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI',
        'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'
    ];
    const now = new Date();
    const day = now.getDate().toString().padStart(2, '0');
    const month = months[now.getMonth()];
    const year = now.getFullYear();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${day} ${month} ${year} - ${hours}:${minutes}`;
}

function exportToSheet() {
    // Ambil elemen yang berisi tabel
    const tableStokContainer = document.getElementById('tableStokContainer');

    // Buat array untuk menyimpan data tabel
    const data = [];

    // Iterasi melalui setiap tabel dalam elemen container
    tableStokContainer.querySelectorAll('h4').forEach((heading, index) => {
        const size = heading.textContent;
        const table = heading.nextElementSibling;

        if (table && table.tagName === 'TABLE') {
            const tableData = [];
            const rows = table.querySelectorAll('tbody tr');
            
            // Ambil header tabel
            const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent.trim());

            // Masukkan header ke array data
            tableData.push(headers);

            // Iterasi melalui setiap baris tabel dan ambil data sel
            rows.forEach(row => {
                const cells = Array.from(row.querySelectorAll('td')).map(td => td.textContent.trim());
                tableData.push(cells);
            });

            // Masukkan data tabel ke array data dengan penambahan ukuran tabel sebagai header
            data.push({
                sheetName: size,
                data: tableData
            });
        }
    });

    // Buat workbook dan worksheet
    const wb = XLSX.utils.book_new();

    data.forEach(sheet => {
        const ws = XLSX.utils.aoa_to_sheet(sheet.data);
        XLSX.utils.book_append_sheet(wb, ws, sheet.sheetName);
    });

    const getTitlePage = document.getElementById('titleImage').innerText;

    const nameFileExcel = `${getTitlePage} - ${getFormattedDateTime()}.xlsx`;
    
    // Konversi workbook menjadi file Excel dan simpan
    XLSX.writeFile(wb, nameFileExcel);
}