package com.bamdow.utils;

import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;


public class CustomMultipartFile implements MultipartFile{
    private final byte[] fileContent;
    private final String originalFilename;
    private final String contentType;

    public CustomMultipartFile(byte[] fileContent, String originalFilename, String contentType) {
        this.fileContent = fileContent != null ? fileContent : new byte[0];
        this.originalFilename = originalFilename;
        this.contentType = contentType;
    }

    @Override
    public String getName() {
        return "file";
    }

    @Override
    public String getOriginalFilename() {
        return this.originalFilename;
    }

    @Override
    public String getContentType() {
        return this.contentType;
    }

    @Override
    public boolean isEmpty() {
        return this.fileContent.length == 0;
    }

    @Override
    public long getSize() {
        return this.fileContent.length;
    }

    @Override
    public byte[] getBytes() throws IOException {
        return this.fileContent;
    }

    @Override
    public InputStream getInputStream() throws IOException {
        return new ByteArrayInputStream(this.fileContent);
    }

    @Override
    public void transferTo(File dest) throws IOException, IllegalStateException {
        try (FileOutputStream fos = new FileOutputStream(dest)) {
            fos.write(this.fileContent);
        }
    }

    // 使用自定义实现(未使用)
    public static class CustomMultipartFileConverter {
        public static MultipartFile convertUsingCustom(byte[] fileBytes, String fileName) {
            return new CustomMultipartFile(fileBytes, fileName, "application/octet-stream");
        }
    }
}



