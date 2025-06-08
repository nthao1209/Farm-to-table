// =================================================================
//                      KHAI BÁO BIẾN TOÀN CỤC
// =================================================================
const body = document.querySelector("body");
let currentPage = 1;
const perPage = 12;

// =================================================================
//                      CÁC HÀM TIỆN ÍCH
// =================================================================

function vnd(price) {
    if (typeof price !== 'number' || isNaN(price)) price = 0;
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

// =================================================================
//                      QUẢN LÝ POPUP & MODAL
// =================================================================

function setupPopups() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        // Đóng khi click ra vùng nền mờ
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                closeModal(modal);
            }
        });
    });
}

function closeModal(modal) {
    if (modal) {
        modal.classList.remove('open');
    } else { // Đóng tất cả
        document.querySelectorAll('.modal').forEach(m => m.classList.remove('open'));
    }
    if (body) body.style.overflow = "auto";
}


// =================================================================
//                      QUẢN LÝ SẢN PHẨM & HIỂN THỊ
// =================================================================
// (Các hàm renderProducts, displayList, setupPagination, showHomeProduct, searchProducts giữ nguyên như cũ)
function renderProducts(productsToRender) {
    const productsContainer = document.getElementById('home-products');
    const homeTitle = document.getElementById("home-title");
    if (!productsContainer || !homeTitle) return;

    let productHtml = '';
    if (!productsToRender || productsToRender.length === 0) {
        homeTitle.style.display = "none";
        productHtml = `<div class="no-result"><div class="no-result-h">Không tìm thấy sản phẩm</div><div class="no-result-p">Xin lỗi, chúng tôi không thể tìm được kết quả phù hợp.</div><div class="no-result-i"><i class="fa-light fa-face-sad-cry"></i></div></div>`;
    } else {
        homeTitle.style.display = "block";
        productsToRender.forEach((product) => {
            productHtml += `
            <div class="col-product">
                <article class="card-product">
                    <div class="card-header">
                        <a href="javascript:;" class="card-image-link" onclick="detailProduct(${product.id})">
                            <img class="card-image" src="${product.img}" alt="${product.title}">
                        </a>
                    </div>
                    <div class="food-info">
                        <div class="card-content">
                            <div class="card-title">
                                <a href="javascript:;" class="card-title-link" onclick="detailProduct(${product.id})">${product.title}</a>
                            </div>
                        </div>
                        <div class="card-footer">
                            <div class="product-price">
                                <span class="current-price">${formatPriceWithUnit(product.price, product.unit)}</span>
                            </div>
                            <div class="product-buy">
                                <button onclick="detailProduct(${product.id})" class="card-button order-item"><i class="fa-regular fa-cart-shopping-fast"></i> Đặt món</button>
                            </div>
                        </div>
                    </div>
                </article>
            </div>`;
        });
    }
    productsContainer.innerHTML = productHtml;
}

function displayList(allProducts, perPage, page) {
    const start = (page - 1) * perPage;
    const end = start + perPage;
    const paginatedProducts = allProducts.slice(start, end);
    renderProducts(paginatedProducts);
}

function setupPagination(allProducts, perPage) {
    const pageNavList = document.querySelector('.page-nav-list');
    if (!pageNavList) return;
    pageNavList.innerHTML = '';
    const pageCount = Math.ceil(allProducts.length / perPage);

    for (let i = 1; i <= pageCount; i++) {
        const node = document.createElement(`li`);
        node.classList.add('page-nav-item');
        node.innerHTML = `<a href="javascript:;">${i}</a>`;
        if (currentPage == i) node.classList.add('active');

        node.addEventListener('click', function () {
            currentPage = i;
            displayList(allProducts, perPage, currentPage);
            document.querySelectorAll('.page-nav-item.active').forEach(item => item.classList.remove('active'));
            node.classList.add('active');
            document.getElementById("home-service")?.scrollIntoView({ behavior: 'smooth' });
        });
        pageNavList.appendChild(node);
    }
}

function showHomeProduct(products) {
    const activeProducts = products ? products.filter(item => item.status == 1) : [];
    
    currentPage = 1;
    displayList(activeProducts, perPage, currentPage);
    setupPagination(activeProducts, perPage);
}


// =================================================================
//                      CHI TIẾT SẢN PHẨM & GIỎ HÀNG
// =================================================================
// (Các hàm detailProduct, addCart, animationCart,... giữ nguyên)
function detailProduct(productId) {
    const modal = document.querySelector('.modal.product-detail');
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const infoProduct = products.find(sp => sp.id === productId);

    if (!infoProduct) return;

    const modalHtml = `
    <div class="modal-header">
        <img class="product-image" src="${infoProduct.img}" alt="${infoProduct.title}">
    </div>
    <div class="modal-body">
        <h2 class="product-title">${infoProduct.title}</h2>
        <div class="product-control">
            <div class="priceBox">
                <span class="current-price">${formatPriceWithUnit(infoProduct.price, infoProduct.unit)}</span>
            </div>
            <div class="buttons_added">
                <input class="minus is-form" type="button" value="-">
                <input class="input-qty" max="100" min="1" type="number" value="1">
                <input class="plus is-form" type="button" value="+">
            </div>
        </div>
        <p class="product-description">${infoProduct.desc}</p>
    </div>
    <div class="notebox">
        <p class="notebox-title">Ghi chú</p>
        <textarea class="text-note" id="popup-detail-note" placeholder="Nhập thông tin cần lưu ý..."></textarea>
    </div>
    <div class="modal-footer">
        <div class="price-total">
            <span class="thanhtien">Thành tiền</span>
            <span class="price">${vnd(infoProduct.price)}</span>
        </div>
        <div class="modal-footer-control">
            <button class="button-dathangngay" data-product-id="${infoProduct.id}">Đặt hàng ngay</button>
            <button class="button-dat" id="add-cart"><i class="fa-light fa-basket-shopping"></i></button>
        </div>
    </div>`;
    document.querySelector('#product-detail-content').innerHTML = modalHtml;

    const qtyInput = document.querySelector('#product-detail-content .input-qty');
    const priceText = document.querySelector('#product-detail-content .price');
    
    document.querySelector('#product-detail-content .plus').onclick = () => {
        qtyInput.stepUp();
        priceText.innerHTML = vnd(infoProduct.price * qtyInput.value);
    };
    document.querySelector('#product-detail-content .minus').onclick = () => {
        qtyInput.stepDown();
        priceText.innerHTML = vnd(infoProduct.price * qtyInput.value);
    };
    document.querySelector('#product-detail-content #add-cart').onclick = () => {
        if (localStorage.getItem('currentuser')) {
            addCart(infoProduct.id);
            animationCart();
        } else {
            toast({ title: 'Warning', message: 'Vui lòng đăng nhập để thêm vào giỏ hàng!', type: 'warning', duration: 3000 });
        }
    };
    modal.classList.add('open');
    if (body) body.style.overflow = "hidden";
}

function addCart(productId) {
    let currentUser = JSON.parse(localStorage.getItem('currentuser'));
    if (!currentUser.cart) currentUser.cart = [];
    const soluong = parseInt(document.querySelector('.modal.product-detail .input-qty').value);
    const note = document.querySelector('#popup-detail-note').value.trim() || "Không có ghi chú";
    const productInCartIndex = currentUser.cart.findIndex(item => item.id == productId);
    if (productInCartIndex === -1) {
        currentUser.cart.push({ id: productId, soluong: soluong, note: note });
    } else {
        currentUser.cart[productInCartIndex].soluong += soluong;
    }
    localStorage.setItem('currentuser', JSON.stringify(currentUser));
    updateAmount();
    closeModal(document.querySelector('.modal.product-detail'));
    toast({ title: 'Thành công', message: 'Đã thêm sản phẩm vào giỏ hàng', type: 'success', duration: 2000 });
}

function animationCart() {
    const cartCounter = document.querySelector(".count-product-cart");
    if(cartCounter) {
        cartCounter.style.animation = "slidein 1s ease";
        setTimeout(() => cartCounter.style.animation = "none", 1000);
    }
}


// =================================================================
//                      QUẢN LÝ USER & LOGIN
// =================================================================

function kiemtradangnhap() {
    const currentUser = JSON.parse(localStorage.getItem('currentuser'));
    const authContainer = document.querySelector('.auth-container');
    const menuContainer = document.querySelector('.header-middle-right-menu');

    if (currentUser && authContainer && menuContainer) {
        authContainer.innerHTML = `<span class="text-dndk">Tài khoản</span>
            <span class="text-tk">${currentUser.fullname} <i class="fa-sharp fa-solid fa-caret-down"></i></span>`;
        
        let menuHtml = `<li><a href="javascript:;" onclick="myAccount()"><i class="fa-light fa-circle-user"></i> Tài khoản của tôi</a></li>
            <li><a href="javascript:;" onclick="orderHistory()"><i class="fa-regular fa-bags-shopping"></i> Đơn hàng đã mua</a></li>`;
        
        if (currentUser.userType === 1) {
            menuHtml = `<li><a href="./admin.html"><i class="fa-light fa-gear"></i> Quản lý cửa hàng</a></li>` + menuHtml;
        }

        menuHtml += `<li class="border"><a id="logout" href="javascript:;"><i class="fa-light fa-right-from-bracket"></i> Thoát tài khoản</a></li>`;
        menuContainer.innerHTML = menuHtml;

        document.querySelector('#logout').addEventListener('click', logOut);
    }
}

function logOut() {
    localStorage.removeItem('currentuser');
    window.location.reload();
}

function updateAmount() {
    const currentUser = JSON.parse(localStorage.getItem('currentuser'));
    const cartCounter = document.querySelector('.count-product-cart');
    if (cartCounter) {
        if (currentUser && currentUser.cart && currentUser.cart.length > 0) {
            const amount = currentUser.cart.reduce((sum, item) => sum + (item.soluong || 0), 0);
            cartCounter.innerText = amount;
            cartCounter.style.display = 'flex';
        } else {
            cartCounter.style.display = 'none';
        }
    }
}

// *** HÀM MỚI ĐỂ GẮN LẠI CÁC SỰ KIỆN CHO FORM LOGIN/SIGNUP ***
function setupLoginSignupForms() {
    const signupLink = document.querySelector('.signup-link');
    const loginLink = document.querySelector('.login-link');
    const container = document.querySelector('.signup-login .modal-container');
    const signupBtnHeader = document.getElementById('signup');
    const loginBtnHeader = document.getElementById('login');
    const formsgModal = document.querySelector('.modal.signup-login');
    const signupButton = document.getElementById('signup-button');
    const loginButton = document.getElementById('login-button');

    // Chuyển đổi giữa 2 form
    if (loginLink && container) loginLink.addEventListener('click', () => container.classList.add('active'));
    if (signupLink && container) signupLink.addEventListener('click', () => container.classList.remove('active'));

    // Mở popup từ header
    if (signupBtnHeader && formsgModal) {
        signupBtnHeader.addEventListener('click', () => {
            formsgModal.classList.add('open');
            if (container) container.classList.remove('active');
            if (body) body.style.overflow = "hidden";
        });
    }
    if (loginBtnHeader && formsgModal) {
        loginBtnHeader.addEventListener('click', () => {
            formsgModal.classList.add('open');
            if (container) container.classList.add('active');
            if (body) body.style.overflow = "hidden";
        });
    }

    // Xử lý nút đăng ký
    if (signupButton) {
        signupButton.addEventListener('click', (event) => {
            event.preventDefault();
            // Logic đăng ký của bạn ở đây
            let fullNameUser = document.getElementById('fullname').value;
            let phoneUser = document.getElementById('phone').value;
            let passwordUser = document.getElementById('password').value;
            let passwordConfirmation = document.getElementById('password_confirmation').value;
            let checkSignup = document.getElementById('checkbox-signup').checked;
            let selectedUserType = document.querySelector('input[name="user-role"]:checked') ? parseInt(document.querySelector('input[name="user-role"]:checked').value) : 0;
            
            if (fullNameUser && phoneUser && passwordUser && passwordConfirmation == passwordUser && checkSignup) {
                let user = { fullname: fullNameUser, phone: phoneUser, password: passwordUser, address: '', email: '', status: 1, join: new Date(), cart: [], userType: selectedUserType };
                let accounts = JSON.parse(localStorage.getItem('accounts')) || [];
                if (!accounts.some(acc => acc.phone === user.phone)) {
                    accounts.push(user);
                    localStorage.setItem('accounts', JSON.stringify(accounts));
                    localStorage.setItem('currentuser', JSON.stringify(user));
                    
                    if (user.userType === 1) {
                        toast({ title: 'Thành công', message: 'Tạo tài khoản người bán thành công! Đang chuyển hướng...', type: 'success', duration: 2000 });
                        setTimeout(() => window.location.href = './admin.html', 2000);
                    } else {
                        toast({ title: 'Thành công', message: 'Tạo tài khoản thành công!', type: 'success', duration: 2000 });
                        closeModal(formsgModal);
                        kiemtradangnhap();
                        updateAmount();
                    }
                } else {
                    toast({ title: 'Thất bại', message: 'Số điện thoại này đã được đăng ký!', type: 'error', duration: 3000 });
                }
            } else {
                toast({ title: 'Cảnh báo', message: 'Vui lòng điền đầy đủ và chính xác thông tin!', type: 'warning', duration: 3000 });
            }
        });
    }

    // Xử lý nút đăng nhập
    if (loginButton) {
        loginButton.addEventListener('click', (event) => {
            event.preventDefault();
            // Logic đăng nhập của bạn ở đây
            let phonelog = document.getElementById('phone-login').value;
            let passlog = document.getElementById('password-login').value;
            let accounts = JSON.parse(localStorage.getItem('accounts')) || [];

            if (phonelog && passlog) {
                let userAccount = accounts.find(item => item.phone == phonelog);
                if (!userAccount) {
                    toast({ title: 'Lỗi', message: 'Tài khoản không tồn tại.', type: 'error', duration: 3000 });
                } else if (userAccount.password !== passlog) {
                    toast({ title: 'Cảnh báo', message: 'Sai mật khẩu.', type: 'warning', duration: 3000 });
                } else if (userAccount.status == 0) {
                    toast({ title: 'Cảnh báo', message: 'Tài khoản của bạn đã bị khóa.', type: 'warning', duration: 3000 });
                } else {
                    localStorage.setItem('currentuser', JSON.stringify(userAccount));
                    if (userAccount.userType === 1) {
                        toast({ title: 'Thành công', message: 'Đăng nhập thành công! Đang chuyển hướng...', type: 'success', duration: 2000 });
                        setTimeout(() => window.location.href = './admin.html', 2000);
                    } else {
                        toast({ title: 'Thành công', message: 'Đăng nhập thành công!', type: 'success', duration: 2000 });
                        closeModal(formsgModal);
                        kiemtradangnhap();
                        updateAmount();
                    }
                }
            } else {
                toast({ title: 'Cảnh báo', message: 'Vui lòng nhập số điện thoại và mật khẩu.', type: 'warning', duration: 3000 });
            }
        });
    }
}

// ... các hàm khác như myAccount, orderHistory, userInfo, changePassword, ...


// =================================================================
//                      KHỞI TẠO KHI TẢI TRANG
// =================================================================

function initializeApp() {
    const products = JSON.parse(localStorage.getItem('products')) || [];

    showHomeProduct(products);
    kiemtradangnhap();
    updateAmount();

    // Gọi hàm cài đặt các event listener
    setupPopups();
    setupLoginSignupForms();
}

window.addEventListener('load', initializeApp);