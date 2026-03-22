package com.bamdow;

import ai.djl.modality.cv.Image;
import cn.smartjavaai.common.cv.SmartImageFactory;
import cn.smartjavaai.common.entity.DetectionInfo;
import cn.smartjavaai.common.entity.DetectionResponse;
import cn.smartjavaai.common.entity.R;
import cn.smartjavaai.common.utils.ImageUtils;
import cn.smartjavaai.face.model.facerec.FaceRecModel;
import cn.smartjavaai.face.model.liveness.LivenessDetModel;
import com.alibaba.fastjson.JSONObject;
import com.bamdow.config.SMJAiConfig;
import com.bamdow.constant.MessageConstant;
import com.bamdow.except.BaseException;
import com.bamdow.except.LoginFailedException;
import com.bamdow.mapper.AdministratorMapper;
import com.bamdow.service.FaceFeatureService;
import com.bamdow.utils.SmartJavaAiUtil;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

import static cn.dev33.satoken.SaManager.log;


//测试类这三个方法可以用于测试模型或其运行环境是否安装配置好
@SpringBootTest
class BackendApplicationTests {

    @Autowired
    private SmartJavaAiUtil smartJavaAiUtil;

    @Autowired
    private SMJAiConfig smjAiConfig;

    @Autowired
    private AdministratorMapper administratorMapper;

    @Autowired
    private FaceFeatureService faceFeatureService;

//    @Test
//    //因为前端网页部分没有做人脸注册，所以用来得到模型提取的人脸特征
//    public void featureComparison2(){
//        // 1. 在这里强制指定 JNI 库路径 (必须在调用 DJL 代码之前)
//        System.setProperty("PYTORCH_JNI_LIB",
//                "C:\\Users\\Bamdow\\.djl.ai\\pytorch\\2.7.1-20250812-cpu-win-x86_64\\0.34.0-djl_torch.dll");
//
//        // ============================================================
//
//        try {
//            //高精度模型，速度慢, 追求速度请更换高速模型: getHighSpeedFaceRecModel
//            FaceRecModel faceRecModel = smjAiConfig.getFaceRecModel();
//            //特征提取（提取分数最高人脸特征）,适用于单人脸场景
//            //创建Image对象，可以从文件、url、InputStream创建、BufferedImage、Base64创建，具体使用方法可以查看文档
//            //路径可换为需要提取特征的人脸图片路径
//            Image image1 = SmartImageFactory.getInstance().fromFile("src/main/resources/example/picture1.jpg");
//            R<float[]> featureResult1 = faceRecModel.extractTopFaceFeature(image1);
//            String featureStr = smartJavaAiUtil.arrayToCsv(featureResult1.getData());
////            System.out.println(featureStr);
//            administratorMapper.updateFeature(featureStr,1);
//        }
//        catch (Exception e){
//            e.printStackTrace();
//        }
//    }

//    /**
//     * 测试活体识别
//     */
//    @Test
//public void testLivenessDetectAndDraw(){
//    try {
////        System.load("C:\\Users\\Bamdow\\AppData\\Local\\Temp\\onnxruntime-java...\\onnxruntime.dll");
//        LivenessDetModel livenessDetModel = smjAiConfig.getLivenessDetModel();
//        //创建Image对象，可以从文件、url、InputStream创建、BufferedImage、Base64创建，具体使用方法可以查看文档
//        Image image = SmartImageFactory.getInstance().fromFile("src/main/resources/example/picture2.jpg");
//        R<DetectionResponse> response = livenessDetModel.detect(image);
//        if(response.isSuccess()){
//            for (DetectionInfo detectionInfo : response.getData().getDetectionInfoList()){
//                log.info("活体检测结果：{}", JSONObject.toJSONString(detectionInfo.getFaceInfo().getLivenessStatus().getStatus().getDescription()));
//                ImageUtils.drawRectAndText(image, detectionInfo.getDetectionRectangle(), detectionInfo.getFaceInfo().getLivenessStatus().getStatus().toString());
//                ImageUtils.save(image, "output/detect.jpg");
//            }
//        }else{
//            log.info("活体检测失败：{}", response.getMessage());
//        }
//    } catch (Exception e) {
//        throw new RuntimeException(e);
//    }
//}


//    /**
//     * 测试人脸识别 1：1
//     * @return
//     */
//    @Test
//    public void faceRecognition() {
//        try{
//            FaceRecModel faceRecModel = smjAiConfig.getFaceRecModel();
//            //这里由于只有我自己这个管理员所以直接写的1,得到数据库中的指定id用户人脸信息
//            String savedFeatureStr = faceFeatureService.getFeatureByUserId(1);
//            //数据库存的字符串转为float数组
//            float[] savedFeature = smartJavaAiUtil.csvToArray(savedFeatureStr);
//            //处理图片
//            String imagePath = "src/main/resources/example/picture2.jpg";
//            Image image = SmartImageFactory.getInstance().fromFile(imagePath);
//            R<float[]> featureResult = faceRecModel.extractTopFaceFeature(image);
//            if(featureResult.isSuccess()){
////                SmartJavaAiUtil.log.info("图片人脸特征提取成功：{}", JSONObject.toJSONString(featureResult.getData()));
//            }else{
//                throw new BaseException(MessageConstant.FEATURE_EXTRACTION_FAILED);
//            }
//            float similar = faceRecModel.calculSimilar(savedFeature, featureResult.getData());
//            log.info("相似度{}", similar);
//            //处理异常情况(人脸相似度低于阈值)
//            if(similar >= 0.62f){
//                System.out.println("识别为同一人");
//            }
//            else{
//                //人脸校验不通过
//                throw new LoginFailedException(MessageConstant.FACE_RECOGNITION_FAILED);
//            }
//        }  catch (IOException e) {
//            throw new RuntimeException("图片处理失败", e);
//        } catch (Exception e) {
//            throw new RuntimeException("人脸识别系统异常", e);
//        }
//
//    }
}
