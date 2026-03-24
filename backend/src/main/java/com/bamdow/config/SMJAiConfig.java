package com.bamdow.config;

import cn.smartjavaai.common.cv.SmartImageFactory;
import cn.smartjavaai.common.enums.DeviceEnum;
import cn.smartjavaai.face.config.FaceDetConfig;
import cn.smartjavaai.face.config.FaceRecConfig;
import cn.smartjavaai.face.config.LivenessConfig;
import cn.smartjavaai.face.constant.FaceDetectConstant;
import cn.smartjavaai.face.constant.LivenessConstant;
import cn.smartjavaai.face.enums.FaceDetModelEnum;
import cn.smartjavaai.face.enums.FaceRecModelEnum;
import cn.smartjavaai.face.enums.LivenessModelEnum;
import cn.smartjavaai.face.factory.FaceDetModelFactory;
import cn.smartjavaai.face.factory.FaceRecModelFactory;
import cn.smartjavaai.face.factory.LivenessModelFactory;
import cn.smartjavaai.face.model.facedect.FaceDetModel;
import cn.smartjavaai.face.model.facerec.FaceRecModel;
import cn.smartjavaai.face.model.liveness.LivenessDetModel;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Component;

import java.io.IOException;

// 标记为Spring组件，启动时自动加载
@Component
public class SMJAiConfig {
    //设备类型
    public static DeviceEnum device = DeviceEnum.CPU;

    // 项目启动时初始化SmartImage相关配置
    @PostConstruct
    public static void beforeAll() throws IOException {
        //将图片处理的底层引擎切换为 OpenCV
        SmartImageFactory.setEngine(SmartImageFactory.Engine.OPENCV);
//        修改缓存路径
//        Config.setCachePath("C:\\Users\\Bamdow\\smartjavaai_cache");
    }


    /**
     * 获取人脸检测模型（均衡模型）
     * 均衡模型：兼顾速度和精度
     * 注意事项：SmartJavaAI提供了多种模型选择(更多模型，请查看文档)，切换模型需要同时修改modelEnum及modelPath
     * @return
     */
    public FaceDetModel getFaceDetModel(){
        FaceDetConfig config = new FaceDetConfig();
        //人脸检测模型，SmartJavaAI提供了多种模型选择(更多模型，请查看文档)，切换模型需要同时修改modelEnum及modelPath
        config.setModelEnum(FaceDetModelEnum.MTCNN);
        //下载模型并替换本地路径，下载地址：https://pan.baidu.com/s/10l22x5fRz_gwLr8EAHa1Jg?pwd=1234 提取码: 1234
        config.setModelPath("src/main/resources/model/face_model/mtcnn");
        //只返回相似度大于该值的人脸,需要根据实际情况调整，分值越大越严格容易漏检，分值越小越宽松容易误识别
        config.setConfidenceThreshold(0.5f);
        //用于去除重复的人脸框，当两个框的重叠度超过该值时，只保留一个
        config.setNmsThresh(FaceDetectConstant.NMS_THRESHOLD);
        return FaceDetModelFactory.getInstance().getModel(config);
    }

    /**
     * 获取人脸识别模型（高精度，速度慢）
     * 追求准确度可以使用
     * 也可以使用其他模型，具体其他模型参数可以查看文档：http://doc.smartjavaai.cn/face.html
     * @return
     */
    public FaceRecModel getFaceRecModel(){
        FaceRecConfig config = new FaceRecConfig();
        //高精度模型，速度慢
        config.setModelEnum(FaceRecModelEnum.INSIGHT_FACE_IRSE50_MODEL);
        //模型路径，请下载模型并替换为本地路径：https://pan.baidu.com/s/10l22x5fRz_gwLr8EAHa1Jg?pwd=1234 提取码: 1234
        config.setModelPath("src/main/resources/model/face_model/model_ir_se50.pt");
        //裁剪人脸：如果图片已经是裁剪过的，则请将此参数设置为false
        config.setCropFace(true);
        //开启人脸对齐：适用于人脸不正的场景，开启将提升人脸特征准确度，关闭可以提升性能
        config.setAlign(true);
        config.setDevice(device);
        //指定人脸检测模型
        config.setDetectModel(getFaceDetModel());
        return FaceRecModelFactory.getInstance().getModel(config);
    }


    /**
     * 获取活体检测模型
     * @return
     */
    public LivenessDetModel getLivenessDetModel(){
        LivenessConfig config = new LivenessConfig();
        config.setModelEnum(LivenessModelEnum.IIC_FL_MODEL);
        config.setDevice(device);
        //需替换为实际模型存储路径
        config.setModelPath("src/main/resources/model/face_model/Ali_TongyiLab/IIC_Fl.onnx");
        //人脸活体阈值,可选,默认0.8，超过阈值则认为是真人，低于阈值是非活体
        config.setRealityThreshold(LivenessConstant.DEFAULT_REALITY_THRESHOLD);
        /*视频检测帧数，可选，默认10，输出帧数超过这个number之后，就可以输出识别结果。
        这个数量相当于多帧识别结果融合的融合的帧数。当输入的帧数超过设定帧数的时候，会采用滑动窗口的方式，返回融合的最近输入的帧融合的识别结果。
        一般来说，在10以内，帧数越多，结果越稳定，相对性能越好，但是得到结果的延时越高。*/
        config.setFrameCount(LivenessConstant.DEFAULT_FRAME_COUNT);
        //视频最大检测帧数
        config.setMaxVideoDetectFrames(LivenessConstant.DEFAULT_MAX_VIDEO_DETECT_FRAMES);
        //指定人脸检测模型
        config.setDetectModel(getFaceDetModel());
        return LivenessModelFactory.getInstance().getModel(config);
    }
}
