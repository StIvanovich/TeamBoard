import React, { useContext, useEffect, useRef, useState } from "react";
//import { EPAGES, ServerContext, MediatorContext } from "../../App";

//import md5 from "md5";

const SignUp = ({ epages }) => {
    const mediator = useContext(MediatorContext);
    const server = useContext(ServerContext);

    const loginRef = useRef(null);
    const nickRef = useRef(null);
    const passwordRef = useRef(null);
    const verifyRef = useRef(null);

    const clickHandler = async () => {
        const login = loginRef.current.value;
        const nickname = nickRef.current.value;
        //        const hash = md5(login + passwordRef.current.value);
        const hash = 1;
        const verifyHash = md5(login + verifyRef.current.value);

        server.signUp(login, nickname, hash, verifyHash);
    };

    useEffect(() => {
        const { SIGNUP } = mediator.getEventTypes();
        const { SERVER_ERROR } = mediator.getEventTypes();

        const signUpHandler = () => {
            epages(EPAGES.LOGIN);
        };

        const serverErrorHandler = (error) => {
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
            <img className="logo-SignUp" src={logo} id="test-logo-SignUp" />
            <div className="text-SignUp" id="test-text-SignUp">
                СОЗДАТЬ УЧЕТНУЮ ЗАПИСЬ
            </div>
            <div className="form-SignUp">
                <div className="text-register" id="test-text-register">
                    Регистрация
                </div>
                <input ref={loginRef} className="input-SignUp" placeholder="Логин" id="test-input-login" />
                <input ref={nickRef} className="input-SignUp" placeholder="Никнейм" id="test-input-nick" />
                <input ref={passwordRef} className="input-SignUp" placeholder="Пароль" id="test-input-password" />
                <input ref={verifyRef} className="input-SignUp" placeholder="Подтвердите пароль" id="test-input-verify" />
                <button onClick={clickHandler} className="reg-button" id="test-reg-button">
                    Регистрация
                </button>
                <br />
                <br />
                <br />
                <hr className="hr-SingUp" id="test-hr-SingUp" />
                <div className="estakk" id="test-estakk" onClick={() => epages(EPAGES.LOGIN)}>
                    Уже есть аккаунт
                </div>
            </div>
        </div>
    );
};
export default SignUp;
