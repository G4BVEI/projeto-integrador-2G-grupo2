function Layout({ children }) {
    return (
        <>
            <Header />
            {children}
            <Footer />
        </>
    );
}
export default Layout