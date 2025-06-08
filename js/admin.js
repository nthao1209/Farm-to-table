
function checkLogin() {
    try {
        let currentUser = JSON.parse(localStorage.getItem("currentuser"));
        if (currentUser == null || currentUser.userType == 0) {
            document.body.innerHTML = `<div class="access-denied-section">
                <img class="access-denied-img" src="./assets/img/access-denied.webp" alt="Access Denied">
            </div>`;
        } else {
            if (document.getElementById("name-acc")) {
                document.getElementById("name-acc").innerHTML = currentUser.fullname;
            }
        }
    } catch (error) {
        console.error("Error checking login status:", error);
    }
}

// =================================================================
//                       CHỨC NĂNG SIDEBAR VÀ TAB
// =================================================================

function setupSidebarAndTabs() {
    const menuIconButton = document.querySelector(".menu-icon-btn");
    const sidebar = document.querySelector(".sidebar");
    if (menuIconButton && sidebar) {
        menuIconButton.addEventListener("click", () => {
            sidebar.classList.toggle("open");
        });
    }

    const sidebars = document.querySelectorAll(".sidebar-list-item.tab-content");
    const sections = document.querySelectorAll(".section");
    if (sidebars.length > 0 && sections.length > 0) {
        for (let i = 0; i < sidebars.length; i++) {
            sidebars[i].onclick = function () {
                const activeSidebar = document.querySelector(".sidebar-list-item.active");
                const activeSection = document.querySelector(".section.active");
                if (activeSidebar) activeSidebar.classList.remove("active");
                if (activeSection) activeSection.classList.remove("active");
                sidebars[i].classList.add("active");
                sections[i].classList.add("active");
            };
        }
    }

    const closeBtn = document.querySelectorAll('.section');
    for (let i = 0; i < closeBtn.length; i++) {
        closeBtn[i].addEventListener('click', (e) => {
            if (window.innerWidth <= 768 && sidebar && sidebar.classList.contains("open")) {
                sidebar.classList.remove("open");
            }
        });
    }
}


// =================================================================
//                      HÀM TIỆN ÍCH VÀ THỐNG KÊ
// =================================================================

function vnd(price) {
    if (typeof price !== 'number' || isNaN(price)) {
        price = 0;
    }
    return price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
}

function formatPriceWithUnit(price, unit) {
    const formattedPrice = vnd(price);
    if (unit && unit.trim() !== '') {
        return `${formattedPrice} / ${unit}`;
    }
    return formattedPrice;
}

function formatDate(dateString) {
    const fm = new Date(dateString);
    if (isNaN(fm.getTime())) return "N/A";
    let yyyy = fm.getFullYear();
    let mm = fm.getMonth() + 1;
    let dd = fm.getDate();
    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;
    return `${dd}/${mm}/${yyyy}`;
}

function updateDashboardStats() {
    const products = localStorage.getItem("products") ? JSON.parse(localStorage.getItem("products")) : [];
    const accounts = localStorage.getItem("accounts") ? JSON.parse(localStorage.getItem("accounts")) : [];
    const orders = localStorage.getItem("order") ? JSON.parse(localStorage.getItem("order")) : [];

    if (document.getElementById("amount-user")) {
        document.getElementById("amount-user").innerHTML = accounts.filter(item => item.userType == 0).length;
    }
    if (document.getElementById("amount-product")) {
        document.getElementById("amount-product").innerHTML = products.length;
    }
    if (document.getElementById("doanh-thu")) {
        const totalRevenue = orders.reduce((sum, item) => sum + (item.tongtien || 0), 0);
        document.getElementById("doanh-thu").innerHTML = vnd(totalRevenue);
    }
}

// =================================================================
//                      QUẢN LÝ SẢN PHẨM
// =================================================================

// --- Biến toàn cục cho quản lý sản phẩm
let perPage = 10;
let currentPage = 1;
var indexCur; // Dùng để lưu index sản phẩm đang sửa

// --- Xử lý upload và preview ảnh ---
function setupImageUpload() {
    const imageUploadInput = document.querySelector('#up-hinh-anh');
    const imagePreview = document.querySelector('.upload-image-preview');

    if (imageUploadInput && imagePreview) {
        imageUploadInput.addEventListener('change', function () {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (event) {
                    imagePreview.setAttribute('src', event.target.result);
                }
                reader.readAsDataURL(file);
            }
        });
    }
}

// --- Hàm tạo ID mới, an toàn ---
function createProductId(arr) {
    if (!arr || arr.length === 0) return 1;
    const maxId = Math.max(0, ...arr.map(item => item.id));
    return maxId + 1;
}

// --- Thêm sản phẩm mới ---
function setupAddProduct() {
    const btnAddProductIn = document.getElementById("add-product-button");
    if (btnAddProductIn) {
        btnAddProductIn.addEventListener("click", (e) => {
            e.preventDefault();

            const imgProduct = document.querySelector(".upload-image-preview").src;
            const tenMon = document.getElementById("ten-mon").value.trim();
            const price = document.getElementById("gia-moi").value;
            const donviTinh = document.getElementById("don-vi-tinh").value.trim();
            const moTa = document.getElementById("mo-ta").value.trim();
            const categoryText = document.getElementById("chon-mon").value;

            if (imgProduct.includes("blank-image.png")) {
                return toast({ title: "Chú ý", message: "Vui lòng chọn ảnh cho món ăn!", type: "warning", duration: 3000 });
            }
            if (!tenMon || !price || !moTa) {
                return toast({ title: "Chú ý", message: "Vui lòng nhập đầy đủ thông tin món!", type: "warning", duration: 3000 });
            }
            if (isNaN(price) || Number(price) < 0) {
                return toast({ title: "Chú ý", message: "Giá phải là một số hợp lệ!", type: "warning", duration: 3000 });
            }

            const products = localStorage.getItem("products") ? JSON.parse(localStorage.getItem("products")) : [];
            const product = {
                id: createProductId(products),
                title: tenMon,
                img: imgProduct,
                category: categoryText,
                price: parseInt(price),
                unit: donviTinh,
                desc: moTa,
                status: 1
            };

            products.unshift(product);
            localStorage.setItem("products", JSON.stringify(products));

            showProduct();
            document.querySelector(".add-product").classList.remove("open");
            toast({ title: "Success", message: "Thêm sản phẩm thành công!", type: "success", duration: 3000 });
            setDefaultValue();
        });
    }
}

// --- Sửa sản phẩm ---
function setupUpdateProduct() {
    const btnUpdateProductIn = document.getElementById("update-product-button");
    if (btnUpdateProductIn) {
        btnUpdateProductIn.addEventListener("click", (e) => {
            e.preventDefault();
            const products = JSON.parse(localStorage.getItem("products"));
            const originalProduct = products[indexCur];

            const updatedProduct = {
                id: originalProduct.id,
                title: document.getElementById("ten-mon").value.trim(),
                img: document.querySelector(".upload-image-preview").src,
                category: document.getElementById("chon-mon").value,
                price: parseInt(document.getElementById("gia-moi").value),
                unit: document.getElementById("don-vi-tinh").value.trim(),
                desc: document.getElementById("mo-ta").value.trim(),
                status: originalProduct.status,
            };

            if (JSON.stringify(originalProduct) === JSON.stringify(updatedProduct)) {
                return toast({ title: "Warning", message: "Sản phẩm không có gì thay đổi!", type: "warning", duration: 3000 });
            }

            products[indexCur] = updatedProduct;
            localStorage.setItem("products", JSON.stringify(products));

            toast({ title: "Success", message: "Sửa sản phẩm thành công!", type: "success", duration: 3000 });
            setDefaultValue();
            document.querySelector(".add-product").classList.remove("open");
            showProduct();
        });
    }
}

// --- Hiển thị danh sách sản phẩm và phân trang ---
function showProductArr(arr) {
    const productContainer = document.getElementById("show-product");
    if (!productContainer) return;

    let productHtml = "";
    if (!arr || arr.length === 0) {
        productHtml = `<div class="no-result"><div class="no-result-i"><i class="fa-light fa-face-sad-cry"></i></div><div class="no-result-h">Không có sản phẩm để hiển thị</div></div>`;
    } else {
        arr.forEach(product => {
            const btnCtl = product.status == 1
                ? `<button class="btn-delete" onclick="deleteProduct(${product.id})"><i class="fa-regular fa-trash"></i></button>`
                : `<button class="btn-restore" onclick="changeStatusProduct(${product.id})"><i class="fa-regular fa-eye"></i></button>`;

            productHtml += `
            <div class="list">
                <div class="list-left">
                    <img src="${product.img}" alt="${product.title}">
                    <div class="list-info">
                        <h4>${product.title}</h4>
                        <p class="list-note">${product.desc}</p>
                        <span class="list-category">${product.category}</span>
                    </div>
                </div>
                <div class="list-right">
                    <div class="list-price">
                        <span class="list-current-price">${formatPriceWithUnit(product.price, product.unit)}</span>
                    </div>
                    <div class="list-control">
                        <div class="list-tool">
                            <button class="btn-edit" onclick="editProduct(${product.id})"><i class="fa-light fa-pen-to-square"></i></button>
                            ${btnCtl}
                        </div>
                    </div>
                </div>
            </div>`;
        });
    }
    productContainer.innerHTML = productHtml;
}

function displayList(productAll, perPage, page) {
    const start = (page - 1) * perPage;
    const end = start + perPage;
    const productShow = productAll.slice(start, end);
    showProductArr(productShow);
}

function setupPagination(productAll, perPage) {
    const pageList = document.querySelector('.page-nav-list');
    if (!pageList) return;
    pageList.innerHTML = '';
    const page_count = Math.ceil(productAll.length / perPage);
    for (let i = 1; i <= page_count; i++) {
        const li = paginationChange(i, productAll, perPage);
        pageList.appendChild(li);
    }
}

function paginationChange(page, productAll, perPage) {
    const node = document.createElement(`li`);
    node.classList.add('page-nav-item');
    node.innerHTML = `<a href="javascript:;">${page}</a>`;
    if (currentPage == page) node.classList.add('active');

    node.addEventListener('click', function () {
        currentPage = page;
        displayList(productAll, perPage, currentPage);
        const activeNodes = document.querySelectorAll('.page-nav-list .active');
        activeNodes.forEach(activeNode => activeNode.classList.remove('active'));
        node.classList.add('active');
    });
    return node;
}

// --- Lọc và tìm kiếm sản phẩm ---
function showProduct() {
    currentPage = 1;
    const selectOp = document.getElementById('the-loai').value;
    const valeSearchInput = document.getElementById('form-search-product').value.toLowerCase();
    const products = localStorage.getItem("products") ? JSON.parse(localStorage.getItem("products")) : [];
    let result = [];

    if (selectOp === "Tất cả") {
        result = products.filter(item => item.status == 1);
    } else if (selectOp === "Đã xóa") {
        result = products.filter(item => item.status == 0);
    } else {
        result = products.filter(item => item.category === selectOp && item.status == 1);
    }

    if (valeSearchInput) {
        result = result.filter(item =>
            item.title.toLowerCase().includes(valeSearchInput)
        );
    }

    displayList(result, perPage, currentPage);
    setupPagination(result, perPage);
}

// --- Các hàm hành động cho sản phẩm ---
function cancelSearchProduct() {
    document.getElementById('the-loai').value = "Tất cả";
    document.getElementById('form-search-product').value = "";
    showProduct();
}

function deleteProduct(id) {
    const products = JSON.parse(localStorage.getItem("products"));
    const index = products.findIndex(item => item.id == id);
    if (index !== -1 && confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
        products[index].status = 0;
        localStorage.setItem("products", JSON.stringify(products));
        toast({ title: 'Success', message: 'Xóa sản phẩm thành công!', type: 'success', duration: 3000 });
        showProduct();
    }
}

function changeStatusProduct(id) {
    const products = JSON.parse(localStorage.getItem("products"));
    const index = products.findIndex(item => item.id == id);
    if (index !== -1 && confirm("Bạn có chắc chắn muốn khôi phục sản phẩm này?")) {
        products[index].status = 1;
        localStorage.setItem("products", JSON.stringify(products));
        toast({ title: 'Success', message: 'Khôi phục sản phẩm thành công!', type: 'success', duration: 3000 });
        showProduct();
    }
}

function editProduct(id) {
    const products = JSON.parse(localStorage.getItem("products"));
    const index = products.findIndex(item => item.id == id);
    if (index === -1) return;

    indexCur = index;
    const productToEdit = products[index];

    document.querySelectorAll(".add-product-e").forEach(item => { item.style.display = "none"; });
    document.querySelectorAll(".edit-product-e").forEach(item => { item.style.display = "block"; });

    document.querySelector(".upload-image-preview").src = productToEdit.img;
    document.getElementById("ten-mon").value = productToEdit.title;
    document.getElementById("gia-moi").value = productToEdit.price;
    document.getElementById("don-vi-tinh").value = productToEdit.unit || '';
    document.getElementById("mo-ta").value = productToEdit.desc;
    document.getElementById("chon-mon").value = productToEdit.category;

    document.querySelector(".add-product").classList.add("open");
}

function setDefaultValue() {
    const imagePreview = document.querySelector(".upload-image-preview");
    const imageUploadInput = document.querySelector('#up-hinh-anh');
    if (imagePreview) imagePreview.src = "./assets/img/blank-image.png";
    document.getElementById("ten-mon").value = "";
    document.getElementById("gia-moi").value = "";
    document.getElementById("don-vi-tinh").value = "";
    document.getElementById("mo-ta").value = "";
    document.getElementById("chon-mon").value = "Món chay";
    if (imageUploadInput) imageUploadInput.value = "";
}

// --- Mở/Đóng Popup ---
function setupPopups() {
    const btnAddProduct = document.getElementById("btn-add-product");
    if (btnAddProduct) {
        btnAddProduct.addEventListener("click", () => {
            setDefaultValue();
            document.querySelectorAll(".add-product-e").forEach(item => { item.style.display = "block"; });
            document.querySelectorAll(".edit-product-e").forEach(item => { item.style.display = "none"; });
            document.querySelector(".add-product").classList.add("open");
        });
    }

    const closePopupButtons = document.querySelectorAll(".modal-close");
    closePopupButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            if (modal) {
                modal.classList.remove("open");
            }
        });
    });
}


window.addEventListener('load', () => {
    // Chạy các hàm khởi tạo
    checkLogin();
    setupSidebarAndTabs();
    updateDashboardStats();
    setupImageUpload();
    setupAddProduct();
    setupUpdateProduct();
    setupPopups();

    // Hiển thị dữ liệu ban đầu
    showProduct();
    
    // Thêm các hàm hiển thị dữ liệu khác nếu cần
    // showOrder();
    // showUser();
    // showThongKe();
});

// --- Logout ---
const logoutButton = document.getElementById("logout-acc");
if (logoutButton) {
    logoutButton.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem("currentuser");
        window.location.href = "/";
    });
}