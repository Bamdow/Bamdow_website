package com.bamdow.pojo.result;

import lombok.Data;
import java.util.Date;

@Data
public class Result<T> {
    private int code;
    private String message;
    private T data;
//    private long timestamp;

    private Result(int code, String message, T data) {
        this.code = code;
        this.message = message;
        this.data = data;
//        this.timestamp = new Date().getTime();
    }

    // 成功响应
    public static <T> Result<T> success(T data) {
        return new Result<>(200, "success", data);
    }

    // 成功响应（无数据）
    public static Result<Void> success() {
        return new Result<>(200, "success", null);
    }

    // 错误响应
    public static <T> Result<T> error(int code, String message) {
        return new Result<>(code, message, null);
    }

    // 错误响应（默认500错误）
    public static <T> Result<T> error(String message) {
        return new Result<>(500, message, null);
    }
}