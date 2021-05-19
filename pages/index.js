import axios from "axios";
import dateformt from "dateformat";
import Head from "next/head";
import { useEffect, useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
} from "react-query";
import styles from "../styles/Home.module.css";
import Clipboard from "clipboard";
import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@material-ui/core";
import LoadingButton from "@material-ui/lab/LoadingButton";

const mockData = [
  {
    classId: "8",
    school: "438015",
    teacher: [
      // { openId: "ad52fb79-0864-4c7a-a959-b2676277ce65", name: "test树童" },
    ],
    student: [
      // { openId: "9c7a864f-d36c-4a5a-ab7a-039c6a2b31b6", name: "陈丹丹01" },
      // { openId: "dd95f67b-cd36-4bb9-aa75-767dd4f22421", name: "自动化测试" },
      // { openId: "665f0fa6-144e-4542-b9d9-52a50604ff0b", name: "自动化测试" },
    ],
  },
];
const UserInfo = ({ setOpenId, setRole }) => {
  const [enabled, setEnable] = useState(false);

  const [classId, setClassId] = useState(mockData[0].classId);
  const { data, isFetching, isSuccess, isError, error, refetch } = useQuery(
    "classInfo",
    async () => {
      console.log("ss", classId);
      const res = await axios.get("/api/classInfo", { params: { classId } });
      return res.data;
    },
    {
      initialData: mockData,
      enabled,
      onSuccess: () => {
        setEnable(false);
      },
      onError: () => {
        setEnable(false);
      },
    }
  );

  return (
    <div>
      <h4>用户openid例子</h4>
      <LoadingButton
        loadingIndicator="Loading..."
        loading={isFetching}
        onClick={() => {
          setEnable(true);
        }}
      >
        获取用户列表
      </LoadingButton>
      {isError && <textarea>{JSON.stringify(error)}</textarea>}
      {data.map((mock, key) => {
        return (
          <div key={key}>
            {mock.teacher.map((t, idx) => (
              <div
                key={`t_${idx}`}
                data-clipboard-target={`#t_${mock.classId}_${t.openId}`}
                className="btn"
                onClick={() => {
                  setOpenId(t.openId);
                  setRole("teacher");
                }}
              >
                {`老师 ${t.name} `}
                <span id={`t_${mock.classId}_${t.openId}`}>{t.openId}</span>
              </div>
            ))}

            <hr />
            {mock.student.map((t, idx) => (
              <div
                key={`s_${idx}`}
                data-clipboard-target={`#s_${mock.classId}_${t.openId}`}
                className="btn"
                onClick={() => {
                  setOpenId(t.openId);
                  setRole("student");
                }}
              >
                {`学生 ${t.name} `}
                <span id={`s_${mock.classId}_${t.openId}`}>{t.openId}</span>
              </div>
            ))}
            <hr />
            <div>
              班级Id:
              <input
                defaultValue={mock.classId}
                onChange={(e) => setClassId(e.target.value)}
              ></input>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const DeleteButton = ({ homework, token }) => {
  const deleteHomework = useMutation(({ homeworkId, token }) =>
    axios.get("/api/delete-homework", {
      params: { homeworkId: homeworkId, token: token },
    })
  );

  return (
    <>
      {deleteHomework.isIdle && (
        <Button
          onClick={() => {
            deleteHomework
              .mutateAsync({ homeworkId: homework.uuid, token: token })
              .then((res) => {});
          }}
        >
          删除
        </Button>
      )}
      {deleteHomework.isLoading && "删除中"}
      {deleteHomework.isSuccess && "已删除"}
      {deleteHomework.isError && "删除失败"}
    </>
  );
};
const Result = ({ data }) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", padding: "10px" }}>
      {data.previewUrl && (
        <Button>
          <a href={data.previewUrl} target="__blank">
            点击打开老师布置
          </a>
        </Button>
      )}

      <Button data-clipboard-target="#accessToken" className="btn">
        copy accessToken
      </Button>
      <p
        id="accessToken"
        style={{ width: "90%", wordBreak: "break-all", textAlign: "center" }}
      >
        {data.accessToken}
      </p>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 240 }} size="small" aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>hwid</TableCell>
              <TableCell>name</TableCell>
              <TableCell>publishTime</TableCell>
              <TableCell>classId</TableCell>
              <TableCell>action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.homeworkList.map((homework) => (
              <TableRow key={homework.uuid}>
                <TableCell id={`uuid_${homework.uuid}`}>
                  {homework.uuid}
                </TableCell>

                <TableCell>{homework.displayName}</TableCell>
                <TableCell>
                  {dateformt(homework.publishTime, "mm/dd, h:mm:ss")}
                </TableCell>
                <TableCell>{homework.thirdPartyClazzId}</TableCell>
                <TableCell>
                  <Button>
                    <a
                      href={`/api/open?uuid=${homework.uuid}&token=${data.accessToken}&role=${data.role}`}
                      target="__blank"
                    >
                      open_5
                    </a>
                  </Button>
                  <DeleteButton homework={homework} token={data.token} />
                  <Button
                    data-clipboard-target={`#uuid_${homework.uuid}`}
                    className="btn"
                  >
                    copy_hwid
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};
function Home() {
  useEffect(() => {
    const c = new Clipboard(".btn");

    return () => {
      c.destroy();
    };
  }, []);
  // window.sessionStorage.setItem()
  const [role, setRole] = useState("teacher");
  const [openId, setOpenId] = useState("");
  const [enabled, setEnable] = useState(false);

  const { data, isFetching, isSuccess, isError, error } = useQuery(
    "ss",
    async () => {
      return await axios.get("/api/info", {
        params: { role, openId },
      });
    },
    {
      enabled,
      onSuccess: () => {
        setEnable(false);
      },
      onError: () => {
        setEnable(false);
      },
    }
  );

  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <UserInfo setOpenId={setOpenId} setRole={setRole} />

      <div>
        <h3>用户信息（必填）：</h3>
        <div>
          <label>填入用户openid：</label>
          <input
            id="userOpenid"
            type="text"
            value={openId}
            onChange={(e) => setOpenId(e.target.value)}
          />
        </div>
        <div>
          <label>选择用户类型：</label>
          <select
            id="userType"
            onChange={(e) => {
              setRole(e.target.value);
            }}
            value={role}
          >
            <option value="student">学生</option>
            <option value="teacher">老师</option>
          </select>
        </div>
        <LoadingButton
          loading={isFetching}
          loadingIndicator="Loading"
          onClick={() => {
            if (openId) {
              setEnable(true);
            } else {
              alert("参数错误");
            }
          }}
        >
          查询
        </LoadingButton>
      </div>
      {isSuccess && <Result data={data.data} />}
      {isError && <textarea>{JSON.stringify(error)}</textarea>}
    </div>
  );
}
const queryClient = new QueryClient();

const Main = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Home />
    </QueryClientProvider>
  );
};

export default Main;
