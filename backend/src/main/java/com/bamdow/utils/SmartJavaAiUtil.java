package com.bamdow.utils;
import ai.djl.modality.cv.Image;
import cn.smartjavaai.common.cv.SmartImageFactory;
import cn.smartjavaai.common.entity.DetectionInfo;
import cn.smartjavaai.common.entity.DetectionResponse;
import cn.smartjavaai.common.entity.R;
import cn.smartjavaai.common.enums.face.LivenessStatus;
import cn.smartjavaai.face.model.facerec.FaceRecModel;
import cn.smartjavaai.face.model.liveness.LivenessDetModel;
import com.bamdow.config.SMJAiConfig;
import com.bamdow.constant.MessageConstant;
import com.bamdow.except.BaseException;
import com.bamdow.except.LoginFailedException;
import com.bamdow.service.FaceFeatureService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import lombok.extern.slf4j.Slf4j;
import java.io.ByteArrayInputStream;
import com.alibaba.fastjson.JSONObject;
import java.io.IOException;


@Slf4j
@Component
public class SmartJavaAiUtil {
    @Autowired
    private SMJAiConfig smjaiConfig;

    @Autowired
    private FaceFeatureService faceFeatureService;

    /**
     * 人脸识别 1：1
     * @param faceImage
     * @return
     */
    public void faceRecognition(Image faceImage) {
        try{
            FaceRecModel faceRecModel = smjaiConfig.getFaceRecModel();
            //这里由于只有我自己这个管理员所以直接写的1,得到数据库中的指定id用户人脸信息
            String savedFeatureStr = faceFeatureService.getFeatureByUserId(1);
            //数据库存的字符串转为float数组
            float[] savedFeature = csvToArray(savedFeatureStr);
            //处理前端传来的图片
            R<float[]> featureResult = faceRecModel.extractTopFaceFeature(faceImage);
            if(featureResult.isSuccess()){
                SmartJavaAiUtil.log.info("图片人脸特征提取成功：{}", JSONObject.toJSONString(featureResult.getData()));
            }else{
                throw new BaseException(MessageConstant.FEATURE_EXTRACTION_FAILED);
            }
            float similar = faceRecModel.calculSimilar(savedFeature, featureResult.getData());
            log.info("相似度{}", similar);
            //处理异常情况(人脸相似度低于阈值)
            if(similar < 0.62f){
                //人脸校验不通过
                throw new LoginFailedException(MessageConstant.FACE_RECOGNITION_FAILED);
            }
        } catch (BaseException e) {
            throw e;
        } catch (Exception e) {
            throw new BaseException("人脸识别系统异常");
        }

    }


    /**
     * 图片活体检测并绘制结果
     */
    public void testLivenessDetect(Image faceImage){
        try {
            LivenessDetModel livenessDetModel = smjaiConfig.getLivenessDetModel();
            //创建Image对象，可以从文件、url、InputStream创建、BufferedImage、Base64创建，具体使用方法可以查看文档
            R<DetectionResponse> response = livenessDetModel.detect(faceImage);
            if(response.isSuccess()){
                DetectionResponse data = response.getData();

                // 防止无人脸时发生空指针异常
                if (data == null || data.getDetectionInfoList() == null || data.getDetectionInfoList().isEmpty()) {
                    log.warn("活体检测失败：图片中未检测到人脸");
                    throw new LoginFailedException("未检测到人脸，请重试");

                }

                for (DetectionInfo detectionInfo : response.getData().getDetectionInfoList()){
                    //再次判空，防止单条数据缺失
                    if (detectionInfo.getFaceInfo() == null || detectionInfo.getFaceInfo().getLivenessStatus() == null) {
                        continue;
                    }
                    if(detectionInfo.getFaceInfo().getLivenessStatus().getStatus()!=LivenessStatus.LIVE){
                        //活体检测不通过
                        log.info("活体检测未通过，状态：{}", detectionInfo.getFaceInfo().getLivenessStatus().getStatus().getDescription());
                        throw new LoginFailedException(MessageConstant.FACE_RECOGNITION_FAILED);
                    }
                }
            }
        } catch (BaseException e) {
            throw e;
        } catch (Exception e) {
            throw new BaseException("活体检测系统异常");
        }
    }




    /**
     * 字符串转浮点数组
     * @param csvStr
     * @return
     */
    public float[] csvToArray(String csvStr) {
        String[] parts = csvStr.split(",");
        float[] feature = new float[parts.length];
        for (int i = 0; i < parts.length; i++) {
            feature[i] = Float.parseFloat(parts[i]);
        }
        return feature;
    }

    /**
     * 浮点数组转字符串
     * @param feature
     * @return
     */
    public String arrayToCsv(float[] feature) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < feature.length; i++) {
            sb.append(feature[i]);
            // 如果不是最后一个元素，添加逗号和空格
            if (i < feature.length - 1) {
                sb.append(", ");
            }
        }
        return sb.toString();
    }
}
