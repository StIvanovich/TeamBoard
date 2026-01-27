import React, { useContext, useEffect, useRef, useState } from "react";
import "./Login.css";
import { EPAGES, MediatorContext, ServerContext } from "../../App";

const Login = ({ epages }) => {
    const mediator = useContext(MediatorContext);
    const server = useContext(ServerContext);

    const loginRef = useRef(null);
    const passwordRef = useRef(null);

    const [error, setError] = useState(null);

    const clickHandler = async () => {
        setError(null);
        const login = loginRef.current.value.trim();
        const password = passwordRef.current.value;

        if (!login || !password) {
            setError({ code: 1012, text: "Введите логин и пароль" });
            return;
        }

        server.login(login, password);
        const { PLAY_MUSIC } = mediator.getEventTypes();
        mediator.call(PLAY_MUSIC);
    };

    useEffect(() => {
        const { LOGIN } = mediator.getEventTypes();
        const { SERVER_ERROR } = mediator.getEventTypes();

        const loginHandler = () => {
            server.loadFriends();
            epages(EPAGES.MENU);
        };
        const serverErrorHandler = (error) => {
            setError(error);
        };

        mediator.subscribe(LOGIN, loginHandler);
        mediator.subscribe(SERVER_ERROR, serverErrorHandler);

        return () => {
            mediator.unsubscribe(LOGIN, loginHandler);
            mediator.unsubscribe(SERVER_ERROR, serverErrorHandler);
        };
    });

    return (
        <div className="Login" id="test-login">
            <div className="logoLogin" id="test-logo"></div>
            <div className="containerLogin" id="test-container" onClick={() => {}}>
                <div className="containerLoginHeader" id="test-header">
                    Войти
                </div>
                <div>
                    <input ref={loginRef} className="loginInput" placeholder="Логин" id="test-login-input" />
                    <input ref={passwordRef} type="password" className="loginInput" placeholder="Пароль" id="test-password-input" />
                </div>

                <div className="checkboxLogin-container" id="test-checkbox-container">
                    <input type="checkbox" className="checkboxLogin" id="test-remember-checkbox" />
                    <div className="checkboxLoginText" id="test-text-checkbox">
                        Не выходить из учетной записи
                    </div>
                </div>

                <button className="loginButton" onClick={clickHandler} id="test-login-button">
                    Продолжить
                </button>

                <hr className="hrLogin" id="test-hrLogin" />

                <div className="otherButtonsLogin" id="test-other-buttons">
                    <button className="otherButtonLogin" id="test-forgot-password-button">
                        Не можете войти?
                    </button>
                    <button className="otherButtonLogin" onClick={() => epages(EPAGES.SIGNUP)} id="test-create-account-button">
                        Создать учетную запись
                    </button>
                </div>
            </div>
            {error ? (
                <div>
                    <span>{error.code}:</span>
                    <span>{error.text}</span>
                </div>
            ) : (
                ""
            )}
        </div>
    );
};

export default Login;
