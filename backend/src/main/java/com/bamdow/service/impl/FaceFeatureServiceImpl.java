package com.bamdow.service.impl;


import com.bamdow.mapper.AdministratorMapper;
import com.bamdow.service.FaceFeatureService;
import com.bamdow.utils.SmartJavaAiUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class FaceFeatureServiceImpl implements FaceFeatureService {

    @Autowired
    private AdministratorMapper administratorMapper;

    @Override
    public String getFeatureByUserId(int i) {
        return administratorMapper.getFeatureByUserId(i);
    }

}
