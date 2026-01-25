import React, { useContext, useEffect, useRef, useState } from "react";
import { EPAGES, ServerContext, MediatorContext } from "../../App";
import logo from "../SingUp/image/logo.jpg";
import "../SingUp/SignUp.css";

const SignUp = ({ epages }) => {
    const mediator = useContext(MediatorContext);
    const server = useContext(ServerContext);
    const loginRef = useRef(null);
    const nickRef = useRef(null);
    const passwordRef = useRef(null);
    const verifyRef = useRef(null);

    const [error, setError] = useState(null);

    const clickHandler = async () => {
        setError(null);
        const login = loginRef.current.value.trim();
        const nickname = nickRef.current.value.trim();
        const password = passwordRef.current.value;
        const verify = verifyRef.current.value;

        if (!login || !nickname || !password || !verify) {
            setError({ code: 1001, text: "Заполните все поля" });
            return;
        }

        if (password !== verify) {
            setError({ code: 1502, text: "Пароли не совпадают" });
            return;
        }

        server.signUp(login, nickname, password);
    };

    useEffect(() => {
        const { SIGNUP } = mediator.getEventTypes();
        const { SERVER_ERROR } = mediator.getEventTypes();

        const signUpHandler = () => {
            epages(EPAGES.LOGIN);
        };

        const serverErrorHandler = (error) => {
            console.log(error);
            setError(error);
        };
        mediator.subscribe(SIGNUP, signUpHandler);
        mediator.subscribe(SERVER_ERROR, serverErrorHandler);

        return () => {
            mediator.unsubscribe(SIGNUP, signUpHandler);
            mediator.unsubscribe(SERVER_ERROR, serverErrorHandler);
        };
    });

    return (
        <div className="container-SignUp" id="test-container-SignUp">
            <div className="text-SignUp" id="test-text-SignUp">
                Team Board
            </div>
            <div className="form-SignUp">
                <div className="text-register" id="test-text-register">
                    Регистрация
                </div>
                <input ref={loginRef} className="input-SignUp" placeholder="Логин" id="test-input-login" />
                <input ref={nickRef} className="input-SignUp" placeholder="Никнейм" id="test-input-nick" />
                <input ref={passwordRef} type="password" className="input-SignUp" placeholder="Пароль" id="test-input-password" />
                <input ref={verifyRef} type="password" className="input-SignUp" placeholder="Подтвердите пароль" id="test-input-verify" />
                <button onClick={clickHandler} className="reg-button" id="test-reg-button">
                    Регистрация
                </button>
                <hr className="hr-SingUp" id="test-hr-SingUp" />
                <div className="estakk" id="test-estakk" onClick={() => epages(EPAGES.LOGIN)}>
                    Уже есть аккаунт?
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
export default SignUp;
