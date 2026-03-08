# 后端处理Markdown文件并上传到阿里云OSS的实现方案

## 1. 需求分析

需要实现一个后端服务，处理前端上传的Markdown格式文章和图片，具体流程为：
1. 提取Markdown文件中的所有图片
2. 将图片上传到阿里云OSS，获取公开访问URL
3. 解析并修改Markdown文本，将本地图片路径替换为OSS URL
4. 将修改后的Markdown文件上传到OSS
5. 返回修改后的Markdown文件在OSS上的URL

## 2. 技术栈分析

### 现有技术栈
- Spring Boot 框架
- 阿里云OSS SDK
- 已有的OSS配置和工具类

### 新增依赖
- 无新增依赖，使用现有技术栈即可实现

## 3. 实现方案

### 3.1 核心流程设计

1. **接收上传文件**：通过HTTP POST请求接收前端上传的Markdown文件
2. **解析Markdown文件**：读取文件内容，提取其中的图片
3. **图片处理**：
   - 提取图片数据
   - 上传到OSS并获取URL
4. **修改Markdown内容**：
   - 替换图片路径为OSS URL
5. **上传修改后的Markdown**：
   - 将修改后的内容上传到OSS
6. **返回结果**：
   - 返回修改后的Markdown文件在OSS上的URL

### 3.2 代码结构设计

#### 3.2.1 新增类

| 类名 | 说明 | 路径 |
|------|------|------|
| MarkdownProcessor | Markdown文件处理工具类 | `src/main/java/com/bamdow/utils/MarkdownProcessor.java` |
| MarkdownController | Markdown上传控制器 | `src/main/java/com/bamdow/controller/admin/MarkdownController.java` |

#### 3.2.2 核心方法设计与实现示例

1. **MarkdownProcessor**：
   - `processMarkdown(MultipartFile markdownFile)`: 处理Markdown文件，返回处理后的文件URL
     ```java
     public String processMarkdown(MultipartFile markdownFile) throws IOException {
         // 1. 读取Markdown文件内容
         String content = new String(markdownFile.getBytes());
         
         // 2. 提取图片并处理
         Map<String, String> imagePathMap = new HashMap<>();
         // 实现图片提取和上传逻辑
         
         // 3. 替换图片路径
         String modifiedContent = replaceImagePaths(content, imagePathMap);
         
         // 4. 上传修改后的Markdown文件
         return uploadMarkdown(modifiedContent, markdownFile.getOriginalFilename());
     }
     ```
   
   - `extractImages(String markdownContent)`: 提取Markdown中的图片
     ```java
     private Map<String, String> extractImages(String markdownContent) {
         Map<String, String> imagePathMap = new HashMap<>();
         // 使用正则表达式匹配Markdown图片标签 ![alt](path)
         Pattern pattern = Pattern.compile("!\\[([^\\]]*)\\]\\(([^)]+)\\)");
         Matcher matcher = pattern.matcher(markdownContent);
         
         while (matcher.find()) {
             String imagePath = matcher.group(2);
             // 处理图片（Base64或本地路径）
             String ossUrl = uploadImageToOss(imagePath);
             imagePathMap.put(imagePath, ossUrl);
         }
         return imagePathMap;
     }
     ```
   
   - `replaceImagePaths(String markdownContent, Map<String, String> imagePathMap)`: 替换图片路径
     ```java
     private String replaceImagePaths(String markdownContent, Map<String, String> imagePathMap) {
         String result = markdownContent;
         for (Map.Entry<String, String> entry : imagePathMap.entrySet()) {
             String originalPath = entry.getKey();
             String ossUrl = entry.getValue();
             // 替换图片路径为OSS URL
             result = result.replace(originalPath, ossUrl);
         }
         return result;
     }
     ```
   
   - `uploadMarkdown(String content, String originalFileName)`: 上传修改后的Markdown文件
     ```java
     private String uploadMarkdown(String content, String originalFileName) {
         // 生成唯一文件名，格式：markdown/yyyyMMdd/UUID.md
         String datePath = new SimpleDateFormat("yyyyMMdd").format(new Date());
         String fileName = UUID.randomUUID().toString() + ".md";
         String objectName = "markdown/" + datePath + "/" + fileName;
         
         // 使用AliyunOssUtil上传文件
         byte[] bytes = content.getBytes();
         return aliyunOssUtil.upload(bytes, objectName);
     }
     ```

2. **MarkdownController**：
   - `uploadMarkdown(MultipartFile file)`: 处理Markdown文件上传请求
     ```java
     @PostMapping("/markdown")
     public Result<String> uploadMarkdown(@RequestParam("file") MultipartFile file) {
         try {
             // 调用MarkdownProcessor处理文件
             String markdownUrl = markdownProcessor.processMarkdown(file);
             return Result.success(markdownUrl);
         } catch (Exception e) {
             log.error("Markdown文件处理失败", e);
             return Result.error("Markdown文件处理失败: " + e.getMessage());
         }
     }
     ```

### 3.3 实现细节

#### 3.3.1 Markdown文件解析

使用正则表达式解析Markdown文件中的图片标签，格式为 `![alt](imagePath)`，提取其中的图片路径。

#### 3.3.2 图片处理

##### Base64编码图片处理

```java
private String uploadImageToOss(String imagePath) {
    // 检查是否为Base64编码图片
    if (imagePath.startsWith("data:image/")) {
        // 处理Base64编码图片
        return handleBase64Image(imagePath);
    } else {
        // 处理本地路径图片
        return handleLocalImage(imagePath);
    }
}

private String handleBase64Image(String base64Image) {
    // 提取Base64数据部分
    String base64Data = base64Image.split(",")[1];
    
    // 解码Base64数据
    byte[] imageBytes = Base64.getDecoder().decode(base64Data);
    
    // 生成唯一文件名
    String suffix = getImageSuffixFromBase64(imagePath);
    String fileName = UUID.randomUUID().toString() + suffix;
    String objectName = "images/" + new SimpleDateFormat("yyyyMMdd").format(new Date()) + "/" + fileName;
    
    // 上传到OSS
    return aliyunOssUtil.upload(imageBytes, objectName);
}

private String getImageSuffixFromBase64(String base64Image) {
    // 从Base64头部提取图片类型
    String type = base64Image.split(":")[1].split(";" )[0].split("/")[1];
    return "." + type;
}
```

##### 本地路径图片处理（前端一并提交图片文件的情况）

当前端将Markdown文件和其中引用的本地图片文件一并上传时，后端需要：
1. 接收所有上传的文件（Markdown文件 + 图片文件）
2. 解析Markdown内容，提取图片路径
3. 将提取的图片路径与上传的图片文件匹配
4. 上传图片到OSS并获取URL
5. 替换Markdown中的图片路径

**实现思路**：

**步骤1：修改Controller接口，接收多个文件**
```java
@PostMapping("/markdown")
public Result<String> uploadMarkdown(
        @RequestParam("file") MultipartFile markdownFile,
        @RequestParam(value = "images", required = false) MultipartFile[] imageFiles) {
    try {
        // 调用MarkdownProcessor处理文件，传入图片文件数组
        String markdownUrl = markdownProcessor.processMarkdown(markdownFile, imageFiles);
        return Result.success(markdownUrl);
    } catch (Exception e) {
        log.error("Markdown文件处理失败", e);
        return Result.error("Markdown文件处理失败: " + e.getMessage());
    }
}
```

**步骤2：修改MarkdownProcessor，添加处理图片文件的逻辑**

```java
public String processMarkdown(MultipartFile markdownFile, MultipartFile[] imageFiles) throws IOException {
    // 1. 读取Markdown文件内容
    String content = new String(markdownFile.getBytes());
    
    // 2. 提取图片并处理
    Map<String, String> imagePathMap = extractAndUploadImages(content, imageFiles);
    
    // 3. 替换图片路径
    String modifiedContent = replaceImagePaths(content, imagePathMap);
    
    // 4. 上传修改后的Markdown文件
    return uploadMarkdown(modifiedContent, markdownFile.getOriginalFilename());
}

private Map<String, String> extractAndUploadImages(String markdownContent, MultipartFile[] imageFiles) {
    Map<String, String> imagePathMap = new HashMap<>();
    
    // 使用正则表达式匹配Markdown图片标签 ![alt](path)
    Pattern pattern = Pattern.compile("!\\[([^\\]]*)\\]\\(([^)]+)\\)");
    Matcher matcher = pattern.matcher(markdownContent);
    
    while (matcher.find()) {
        String imagePath = matcher.group(2);
        
        // 检查是否为本地路径图片
        if (!imagePath.startsWith("data:image/")) {
            // 处理本地路径图片
            String ossUrl = handleLocalImage(imagePath, imageFiles);
            imagePathMap.put(imagePath, ossUrl);
        } else {
            // 处理Base64编码图片
            String ossUrl = handleBase64Image(imagePath);
            imagePathMap.put(imagePath, ossUrl);
        }
    }
    
    return imagePathMap;
}

private String handleLocalImage(String localPath, MultipartFile[] imageFiles) {
    // 从本地路径中提取文件名
    String fileName = localPath.substring(localPath.lastIndexOf("/") + 1);
    
    // 查找对应的上传文件
    MultipartFile matchedFile = findMatchedImageFile(fileName, imageFiles);
    
    if (matchedFile == null) {
        throw new RuntimeException("未找到对应的图片文件: " + fileName);
    }
    
    try {
        // 生成唯一文件名
        String suffix = fileName.substring(fileName.lastIndexOf("."));
        String uniqueFileName = UUID.randomUUID().toString() + suffix;
        String objectName = "images/" + new SimpleDateFormat("yyyyMMdd").format(new Date()) + "/" + uniqueFileName;
        
        // 上传到OSS
        byte[] bytes = matchedFile.getBytes();
        return aliyunOssUtil.upload(bytes, objectName);
    } catch (IOException e) {
        throw new RuntimeException("图片文件处理失败: " + e.getMessage());
    }
}

private MultipartFile findMatchedImageFile(String fileName, MultipartFile[] imageFiles) {
    if (imageFiles == null || imageFiles.length == 0) {
        return null;
    }
    
    // 遍历所有上传的图片文件，查找文件名匹配的文件
    for (MultipartFile file : imageFiles) {
        if (file.getOriginalFilename().equals(fileName)) {
            return file;
        }
    }
    
    return null;
}
```

**步骤3：前端上传方式**

前端需要使用`multipart/form-data`格式上传文件，包含：
- `file`字段：Markdown文件
- `images`字段：多个图片文件（使用数组形式）

**示例前端代码（使用FormData）**：
```javascript
const formData = new FormData();
formData.append('file', markdownFile);

// 添加所有图片文件
imageFiles.forEach(file => {
    formData.append('images', file);
});

// 发送请求
fetch('/admin/upload/markdown', {
    method: 'POST',
    body: formData
})
.then(response => response.json())
.then(data => {
    console.log('Markdown文件处理成功:', data.data);
});
```

#### 3.3.3 Markdown内容修改

```java
private String replaceImagePaths(String markdownContent, Map<String, String> imagePathMap) {
    String result = markdownContent;
    
    // 遍历所有图片路径映射
    for (Map.Entry<String, String> entry : imagePathMap.entrySet()) {
        String originalPath = entry.getKey();
        String ossUrl = entry.getValue();
        
        // 使用正则表达式替换图片路径
        // 构建正则表达式，匹配 ![alt](originalPath) 格式
        String regex = "(!\\[([^\\]]*)\\]\\()" + Pattern.quote(originalPath) + "(\\))";
        Pattern pattern = Pattern.compile(regex);
        Matcher matcher = pattern.matcher(result);
        
        // 替换所有匹配的图片路径
        result = matcher.replaceAll("$1" + ossUrl + "$3");
    }
    
    return result;
}
```

**实现说明**：
1. 使用`Pattern.quote()`方法对原始路径进行转义，确保路径中的特殊字符不会影响正则表达式的匹配
2. 使用捕获组保存图片标签的其他部分，只替换路径部分
3. 使用`matcher.replaceAll()`方法替换所有匹配的图片路径
4. 这种方式可以确保只替换Markdown图片标签中的路径，不会影响其他内容

#### 3.3.4 文件上传

- 生成唯一文件名，格式为 `markdown/yyyyMMdd/UUID.md`
- 使用现有的AliyunOssUtil工具类上传文件
- 返回OSS上的文件URL

### 3.4 API接口设计

#### 3.4.1 接口信息

| 接口路径 | 方法 | 功能 | 请求参数 | 响应 |
|---------|------|------|---------|------|
| `/admin/upload/images` | POST | 上传图片文件 | `files: MultipartFile[]` | `{code: 200, message: "成功", data: ["https://xxx.oss-cn-xxx.aliyuncs.com/images/20240101/xxx.png"]}` |
| `/admin/markdown` | POST | 上传并处理Markdown文件 | `file: MultipartFile`<br>`images: MultipartFile[]` | `{code: 200, message: "成功", data: "https://xxx.oss-cn-xxx.aliyuncs.com/markdown/20240101/xxx.md"}` |
| `/admin/markdown` | GET | 分页查询Markdown文件 | `page: int`<br>`size: int` | `{code: 200, message: "成功", data: {total: 10, records: [...]}}` |

#### 3.4.2 请求示例

**上传图片**：
```http
POST /admin/upload/images
Content-Type: multipart/form-data

files: <图片文件1>
files: <图片文件2>
```

**上传Markdown**：
```http
POST /admin/markdown
Content-Type: multipart/form-data

file: <markdown文件>
images: <图片文件1>
images: <图片文件2>
```

**查询Markdown文件**：
```http
GET /admin/markdown?page=1&size=10
```

#### 3.4.3 响应示例

**上传图片响应**：
```json
{
  "code": 200,
  "message": "成功",
  "data": [
    "https://bamdow.oss-cn-hangzhou.aliyuncs.com/images/20240101/550e8400-e29b-41d4-a716-446655440000.png",
    "https://bamdow.oss-cn-hangzhou.aliyuncs.com/images/20240101/660e8400-e29b-41d4-a716-446655440000.png"
  ]
}
```

**上传Markdown响应**：
```json
{
  "code": 200,
  "message": "成功",
  "data": "https://bamdow.oss-cn-hangzhou.aliyuncs.com/markdown/20240101/550e8400-e29b-41d4-a716-446655440000.md"
}
```

**查询Markdown文件响应**：
```json
{
  "code": 200,
  "message": "成功",
  "data": {
    "total": 10,
    "records": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "fileName": "example.md",
        "ossurl": "https://bamdow.oss-cn-hangzhou.aliyuncs.com/markdown/20240101/550e8400-e29b-41d4-a716-446655440000.md"
      }
    ]
  }
}
```

### 3.5 异常处理与日志

- **异常处理**：
  - 文件解析异常：返回400错误
  - OSS上传异常：返回500错误
  - 其他异常：返回500错误

- **日志记录**：
  - 记录文件上传开始和结束
  - 记录图片处理数量
  - 记录OSS上传结果
  - 记录异常信息

## 4. 图片处理方案

### 4.1 实现思路

当前后端实现采用的是**一次性上传**方案，即前端将Markdown文件和其中引用的所有图片文件一起传入后端，后端统一处理：

1. 前端选择Markdown文件和相关图片文件
2. 一次性发送到后端的`/admin/markdown`接口
3. 后端处理Markdown文件，提取图片并上传到OSS
4. 替换Markdown中的图片路径为OSS URL
5. 上传修改后的Markdown文件到OSS
6. 返回处理后的Markdown文件URL

### 4.2 前端实现

**代码示例**：
```javascript
// 存储选择的文件
const selectedFiles = {
    markdown: null,
    images: []
};

// 处理Markdown文件选择
function handleMarkdownSelect(event) {
    selectedFiles.markdown = event.target.files[0];
}

// 处理图片文件选择
function handleImageSelect(event) {
    selectedFiles.images = Array.from(event.target.files);
    
    // 本地预览图片
    const preview = document.getElementById('image-preview');
    preview.innerHTML = '';
    selectedFiles.images.forEach(file => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.style.maxWidth = '100%';
            img.style.margin = '5px';
            preview.appendChild(img);
        };
        reader.readAsDataURL(file);
    });
}

// 提交所有文件
async function submitFiles() {
    if (!selectedFiles.markdown) {
        alert('请选择Markdown文件');
        return;
    }
    
    const formData = new FormData();
    formData.append('file', selectedFiles.markdown);
    
    // 添加所有图片文件
    selectedFiles.images.forEach(file => {
        formData.append('images', file);
    });
    
    // 发送请求
    try {
        const response = await fetch('/admin/markdown', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        if (data.code === 200) {
            console.log('Markdown文件处理成功:', data.data);
            alert('上传成功！');
        } else {
            alert('上传失败: ' + data.message);
        }
    } catch (error) {
        console.error('上传失败:', error);
        alert('上传失败，请稍后重试');
    }
}
```

### 4.3 后端实现

**核心流程**：
1. MarkdownController接收Markdown文件和图片文件
2. 调用MarkdownProcessor处理文件
3. MarkdownProcessor提取图片并上传到OSS
4. 替换Markdown中的图片路径为OSS URL
5. 上传修改后的Markdown文件到OSS
6. 返回处理后的Markdown文件URL

**优势**：
- 只需一次请求，减少网络开销
- 后端统一处理，逻辑清晰
- 支持Base64编码图片和本地路径图片

**适用场景**：
- 批量上传图片的场景
- 对服务器性能要求较高的场景
- 前端实现相对简单的场景

## 5. 实现步骤

### 5.1 后端实现步骤

1. **创建数据访问层**：
   - 创建MarkdownMapper接口和MarkdownImageMapper接口
   - 创建对应的XML映射文件，编写SQL语句

2. **创建服务层**：
   - 创建MarkdownService接口，定义保存和查询方法
   - 创建MarkdownServiceImpl实现类，实现业务逻辑

3. **创建工具类**：
   - 创建MarkdownProcessor工具类，实现Markdown文件处理逻辑
   - 实现图片提取、上传和路径替换功能
   - 实现Markdown文件上传到OSS的功能

4. **创建控制器**：
   - 创建MarkdownController，处理Markdown文件上传和查询请求
   - 注入MarkdownProcessor和MarkdownService

5. **测试接口**：
   - 测试带Base64图片的Markdown文件
   - 测试带本地路径图片的Markdown文件
   - 测试没有图片的Markdown文件
   - 测试分页查询接口
   - 测试异常情况

### 5.2 前端实现步骤

1. **实现Markdown编辑器**：
   - 集成Markdown编辑器，支持图片插入
   - 实现图片上传功能，调用 `/admin/upload/images` 接口
   - 获取返回的OSS URL并插入到编辑器中

2. **实现Markdown上传功能**：
   - 收集用户编辑的Markdown内容
   - 上传Markdown文件和图片文件到 `/admin/markdown` 接口
   - 获取返回的Markdown文件URL

3. **实现Markdown文件列表**：
   - 调用 `/admin/markdown` 接口进行分页查询
   - 展示Markdown文件列表

4. **测试完整流程**：
   - 上传图片并验证回显
   - 编辑Markdown内容并插入图片
   - 上传Markdown文件并验证结果
   - 查看Markdown文件列表

## 6. 注意事项

1. **文件大小限制**：
   - 配置合适的文件大小限制，避免过大的文件导致服务器压力

2. **文件名处理**：
   - 使用UUID生成唯一文件名，避免文件名冲突

3. **路径管理**：
   - 按照日期组织文件路径，便于管理

4. **错误处理**：
   - 妥善处理各种异常情况，确保接口稳定

5. **性能优化**：
   - 对于大文件，考虑使用流式处理，避免内存溢出

## 7. 总结

本方案采用**方案一**的实现方式，利用现有的阿里云OSS集成，实现了Markdown文件的处理和上传功能。具体实现如下：

1. **前端流程**：
   - 用户选择图片后，先通过 `/admin/upload/images` 接口上传图片
   - 获取返回的OSS URL并插入到Markdown编辑器中
   - 上传包含OSS URL的Markdown文件到 `/admin/upload/markdown` 接口

2. **后端流程**：
   - 处理图片上传请求，返回OSS URL
   - 处理Markdown文件上传，处理其中的Base64编码图片
   - 上传修改后的Markdown文件到OSS并返回URL

3. **优势**：
   - 图片可以立即回显，提升用户体验
   - 后端逻辑简化，代码更清晰
   - 前端可以更好地控制上传流程

4. **适用场景**：
   - 对用户体验要求高的场景
   - 需要即时预览图片效果的场景
   - 图片数量不是特别多的场景

该方案设计合理，实现简单，能够满足用户的需求，同时保持了代码的可维护性和扩展性。前端可以按照文档中的API接口设计和实现步骤，正常对接后端接口并完成任务。

## 8. 实体类设计

根据之前设计的数据库表结构，需要创建以下实体类：

### 8.1 MarkdownFile实体类

**路径**：`src/main/java/com/bamdow/pojo/entity/MarkdownFile.java`

```java
package com.bamdow.pojo.entity;

import lombok.Data;

@Data
public class MarkdownFile {
    /**
     * 主键ID
     */
    private String id;
    
    /**
     * 文件名
     */
    private String fileName;
    
    /**
     * OSS文件URL
     */
    private String ossurl;
}
```

### 8.2 MarkdownImage实体类

**路径**：`src/main/java/com/bamdow/pojo/entity/MarkdownImage.java`

```java
package com.bamdow.pojo.entity;

import lombok.Data;

@Data
public class MarkdownImage {
    /**
     * 主键ID
     */
    private String id;
    
    /**
     * 所属Markdown文件ID
     */
    private String markdownId;
    
    /**
     * OSS图片URL
     */
    private String ossurl;
}
```

### 8.3 数据传输对象（DTO）

#### 8.3.1 MarkdownFileCreateDTO

**路径**：`src/main/java/com/bamdow/pojo/dto/MarkdownFileCreateDTO.java`

```java
package com.bamdow.pojo.dto;

import lombok.Data;

@Data
public class MarkdownFileCreateDTO {
    /**
     * OSS文件URL
     */
    private String ossurl;
}
```

#### 8.3.2 MarkdownImageCreateDTO

**路径**：`src/main/java/com/bamdow/pojo/dto/MarkdownImageCreateDTO.java`

```java
package com.bamdow.pojo.dto;

import lombok.Data;

@Data
public class MarkdownImageCreateDTO {
    /**
     * 所属Markdown文件ID
     */
    private String markdownId;
}
```

### 8.4 视图对象（VO）

#### 8.4.1 MarkdownFileVO

**路径**：`src/main/java/com/bamdow/pojo/vo/MarkdownFileVO.java`

```java
package com.bamdow.pojo.vo;

import lombok.Data;

@Data
public class MarkdownFileVO {
    /**
     * 主键ID
     */
    private String id;
    
    /**
     * 文件名
     */
    private String fileName;
    
    /**
     * OSS文件URL
     */
    private String ossurl;
}
```

### 8.5 实体类使用说明

1. **存储Markdown文件信息**：
   - 当上传Markdown文件到OSS后，创建`MarkdownFile`实体并保存到数据库
   - 记录文件的基本信息，如文件名、原始文件名、OSS URL等

2. **存储图片信息**：
   - 当处理Markdown文件中的图片时，创建`MarkdownImage`实体并保存到数据库
   - 记录图片的原始路径、OSS URL、所属Markdown文件ID等

3. **关联查询**：
   - 通过`markdownId`字段关联Markdown文件和图片
   - 可以通过`MarkdownFileVO`和`MarkdownImageVO`返回包含关联信息的数据

4. **业务逻辑集成**：
   - 在`MarkdownProcessor`中处理完文件后，调用相应的Service保存实体到数据库
   - 提供查询、更新、删除等操作的Service和Controller接口

这些实体类和数据传输对象的设计，能够满足Markdown文件和图片的存储、查询和管理需求，为后续的业务逻辑提供基础支持。

## 9. 存储md文件及其图片到数据库的实现方案

### 9.1 实现思路

1. **数据访问层**：创建Mapper接口和XML映射文件，用于操作数据库
2. **服务层**：创建Service接口和实现类，封装业务逻辑
3. **控制器调整**：修改MarkdownController，添加数据库存储逻辑
4. **工具类调整**：修改MarkdownProcessor，支持返回处理结果供数据库存储

### 9.2 具体实现步骤

#### 9.2.1 数据访问层

1. **创建MarkdownMapper接口**
   - 路径：`src/main/java/com/bamdow/mapper/MarkdownMapper.java`
   - 功能：定义Markdown文件的CRUD操作方法
   - 方法包括：插入、分页查询等

2. **创建MarkdownImageMapper接口**
   - 路径：`src/main/java/com/bamdow/mapper/MarkdownImageMapper.java`
   - 功能：定义Markdown图片的CRUD操作方法
   - 方法包括：插入等

3. **创建XML映射文件**
   - 路径：`src/main/resources/mapper/MarkdownMapper.xml`
   - 路径：`src/main/resources/mapper/MarkdownImageMapper.xml`
   - 功能：编写SQL语句，实现Mapper接口中定义的方法

#### 9.2.2 服务层

1. **创建MarkdownService接口**
   - 路径：`src/main/java/com/bamdow/service/MarkdownService.java`
   - 功能：定义Markdown文件相关的业务方法
   - 方法包括：保存Markdown文件记录、保存Markdown图片记录、分页查询等

2. **创建MarkdownServiceImpl实现类**
   - 路径：`src/main/java/com/bamdow/service/impl/MarkdownServiceImpl.java`
   - 功能：实现MarkdownService接口，调用Mapper操作数据库

#### 9.2.3 工具类调整

1. **修改MarkdownProcessor**
   - 路径：`src/main/java/com/bamdow/utils/MarkdownProcessor.java`
   - 功能：
     - 处理Markdown文件，提取并上传图片
     - 替换Markdown中的图片路径为OSS URL
     - 上传修改后的Markdown文件到OSS
     - 返回处理后的Markdown文件URL

#### 9.2.4 控制器调整

1. **修改MarkdownController**
   - 路径：`src/main/java/com/bamdow/controller/admin/MarkdownController.java`
   - 功能：
     - 注入MarkdownProcessor和MarkdownService
     - 处理Markdown文件上传请求，调用MarkdownProcessor处理文件
     - 提供Markdown文件分页查询接口
     - 返回处理结果

#### 9.2.5 数据传输对象（DTO）

1. **MarkdownFileCreateDTO**
   - 路径：`src/main/java/com/bamdow/pojo/dto/MarkdownFileCreateDTO.java`
   - 功能：封装Markdown文件创建信息

2. **MarkdownImageCreateDTO**
   - 路径：`src/main/java/com/bamdow/pojo/dto/MarkdownImageCreateDTO.java`
   - 功能：封装Markdown图片创建信息

### 9.3 业务流程

1. **上传Markdown文件**：
   - 前端调用`/admin/markdown`接口上传Markdown文件和图片文件
   - 后端接收文件并调用MarkdownProcessor处理

2. **处理Markdown文件**：
   - MarkdownProcessor读取文件内容，提取图片
   - 处理Base64编码的图片，上传到OSS并获取URL
   - 处理本地路径图片，查找对应的上传文件并上传到OSS
   - 替换Markdown中的图片路径为OSS URL
   - 上传修改后的Markdown文件到OSS并获取URL
   - 返回处理后的Markdown文件URL

3. **返回响应**：
   - 构造包含Markdown文件URL的响应
   - 前端接收响应，完成上传流程

4. **查询Markdown文件**：
   - 前端调用`/admin/markdown`接口进行分页查询
   - 后端调用MarkdownService进行分页查询
   - 返回查询结果

### 9.4 关键注意事项

1. **事务管理**：确保Markdown文件和图片的存储在同一个事务中，保证数据一致性
2. **错误处理**：妥善处理数据库操作和OSS上传过程中的异常
3. **性能优化**：对于大量图片的Markdown文件，考虑批量插入图片记录
4. **数据验证**：对输入数据进行验证，确保数据完整性
5. **日志记录**：记录关键操作步骤，便于问题排查

### 9.5 实现建议

1. **先实现数据访问层**：创建Mapper接口和XML映射文件
2. **再实现服务层**：创建Service接口和实现类
3. **调整工具类**：修改MarkdownProcessor支持返回处理结果
4. **最后调整控制器**：修改MarkdownController集成数据库存储逻辑
5. **测试验证**：编写测试用例，验证完整流程

通过以上步骤，可以实现Markdown文件及其图片的数据库存储功能，为后续的查询、管理和展示提供基础支持。