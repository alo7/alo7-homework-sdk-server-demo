// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { NextApiResponse } from "next";
import { get } from "lodash";
import * as Axios from "axios";
import * as AxiosLogger from "axios-logger";
/**
 * @param res {NextApiResponse}
 */
export default async (req, res) => {
  const { role, openId } = req.query;
  const axios = Axios.create();
  axios.interceptors.request.use(AxiosLogger.requestLogger,AxiosLogger.errorLogger);
  axios.interceptors.response.use(AxiosLogger.responseLogger,AxiosLogger.errorLogger);
  try {
    const {
      data: { token },
    } = await axios.get(
      `${process.env.GATE_WAY_API}/system/token?app_id=${process.env.APP_ID}&app_secret=${process.env.APP_SECRET}`
    );
    const {
      data: {
        meta: { accessToken },
      },
    } = await axios.get(
      `${process.env.GATE_WAY_API}/account/api/v2/${role}/organization/accessToken`,
      { headers: { "X-ALO7-JWT": token }, params: { openId } }
    );
    const {
      data: { result: homeworkList },
    } = await axios.get(
      `${process.env.GATE_WAY_API}/study-center/api/v4/homework/${role}/${openId}?pageNo=1&pageSize=20`,
      {
        headers: {
          // "X-ALO7-SCHOOL-ID": schoolId,
          "X-ALO7-JWT": token,
        },
      }
    );

    if (role === "teacher") {
      const {
        data: {
          meta: { url: previewUrl },
        },
      } = await axios.get(
        `${process.env.TEACHER_API}/api/v1/h5url/homeworks/assignment`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      res
        .status(200)
        .json({ accessToken, homeworkList, previewUrl, role, openId, token });
    } else {
      res.status(200).json({ accessToken, homeworkList, role, openId, token });
    }
  } catch (e) {
    // console.error(e);
    res.status(500).json({ json: e.toJSON(), errors: get(e, "response.data") });
  }
};
