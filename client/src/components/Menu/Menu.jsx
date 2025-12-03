const Menu = ({ epages }) => {
    return (
        <>
            <span>Это типо твое меню</span>
            <button onClick={clickHandler} className="create-board" id="test-create-board">
                Создать доску
            </button>
        </>
    );
};
export default Menu;
