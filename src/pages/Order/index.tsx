import React, { useEffect, useState } from "react";
import "./style.scss";
import { moneyFormater, moneyFormaterDong } from "../../utils/moneyFormater";
import { getOrderByUserID } from "../../apis/order/gerOrderByUserID";
import { AiOutlineFieldTime } from "react-icons/ai";
import { FaShippingFast } from "react-icons/fa";
import { IoMdCloudDone } from "react-icons/io";
import { getOrderStatus } from "../../apis/enum/orderStatus.api";
import { formatDateCustom } from "../Admin New/components/Manage Transaction/ManageTransaction";
import { userCancleOrder } from "../../apis/order/userCancelOrder.api";
import { notifySuccess } from "../../utils/notify";
import { getLocalStorage, setLocalStorage } from "../../utils/localStorage";

interface OrderProps {}

const OrderPage = (props: OrderProps) => {
  const [orders, setOrders] = React.useState<any>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [tab, setTab] = React.useState<number>(0);
  const [orderEnum, setOrderEnum] = useState<any>([]);
  const [orderCancle, setOrderCancle] = useState<any>([]);
  const [orderShown, setOrderShown] = useState<any>();

  React.useEffect(() => {
    getOrderStatus().then((rs: any) => {
      if (rs && rs?.data) {
        setOrderEnum(rs?.data);
      }
    });
    getOrderByUserID().then((rs: any) => {
      if (rs && rs?.data) {
        setOrders(rs?.data);
      }
    });
    // setOrderShown(orders);
    let orderCancle = JSON.parse(getLocalStorage("order_cancle"));
    setOrderCancle(orderCancle);
  }, []);
  console.log("cancle", orderCancle);
  React.useEffect(() => {
    let temp = [...orders]
      ?.filter((item: any) => {
        return item.processing === orderEnum[tab] && item?.enable === true;
      })
      .sort(
        (a: any, b: any) =>
          Number(Date.parse(formatDateCustom(b.createdOn))) -
          Number(Date.parse(formatDateCustom(a.createdOn)))
      );
    setOrderShown([...temp]);
  }, [orderEnum, orders]);
  React.useEffect(() => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 3000);
    let temp = [...orders]
      ?.filter((item: any) => {
        // let isCancled = orderCancle?.findIndex(
        //   (item: any) => item === item?.id
        // );
        return item.processing === orderEnum[tab] && item?.enable === true;
      })
      .sort(
        (a: any, b: any) =>
          Number(Date.parse(formatDateCustom(b.createdOn))) -
          Number(Date.parse(formatDateCustom(a.createdOn)))
      );
    setOrderShown([...temp]);
  }, [tab]);

  console.log(orders);
  console.log(orderShown);
  const cancelOrder = (id: string) => {
    userCancleOrder(id).then((rs: any) => {
      if (rs && rs?.statusCode === 200) {
        notifySuccess("H???y ????n h??ng th??nh c??ng");
      }
    });
    let tmp = orderCancle;
    tmp.push(id);
    setOrderCancle([...tmp]);
  };
  React.useEffect(() => {
    setLocalStorage("order_cancle", JSON.stringify(orderCancle));
  }, [orderCancle]);

  return (
    <div className="orderPage container">
      <div className="tt">Th??ng tin ????n h??ng c???a b???n:</div>
      <div className="orderPage-wrapper">
        <div className="tabs">
          <div
            className={tab === 0 ? "tab active" : "tab"}
            onClick={() => {
              setTab(0);
            }}
          >
            <AiOutlineFieldTime className="ic waiting" /> ??ang x??? l??
          </div>
          <div
            className={tab === 1 ? "tab active" : "tab"}
            onClick={() => {
              setTab(1);
            }}
          >
            <FaShippingFast className="ic shipping" /> ??ang v???n chuy???n
          </div>
          <div
            className={tab === 2 ? "tab active" : "tab"}
            onClick={() => {
              setTab(2);
            }}
          >
            <IoMdCloudDone className="ic done" /> ???? giao
          </div>
        </div>
      </div>
      <div className="orderPage-bottom" style={{}}>
        {orderShown && !isLoading ? (
          orderShown.length > 0 ? (
            orderShown?.map((item: any, i: any) => (
              <div className="payment">
                <div className="head">
                  <div className="processing">
                    <div className="top">
                      <div className="date">
                        Ng??y t???o: <span>{item?.createdOn}</span>
                      </div>
                      <div className="phone">S??? ??i???n tho???i : {item?.phone}</div>
                    </div>
                    <div className="below">
                      <span> Tr???ng th??i:</span>
                      {item.processing === "Chua_Xu_Ly" ? "  Ch??a x??? l??" : ""}
                      <div className="id">
                        <span> M?? ????n h??ng : </span>
                        {item.id}
                      </div>
                    </div>
                  </div>

                  <div className="payment-status">
                    Thanh to??n:
                    {item?.payment === null ? (
                      <div
                        className="btn-payment"
                        // onClick={() => {
                        //   handlePayment(item.id);
                        // }}
                      >
                        {isLoading ? (
                          <span className="spinner-border spinner-border-sm"></span>
                        ) : (
                          "Ship COD"
                        )}
                      </div>
                    ) : (
                      <div className="btn-payment purchased">
                        ???? thanh to??n (VNPAY)
                      </div>
                    )}
                  </div>
                </div>
                <div className="body">
                  <div className="lb">Danh s??ch s???n ph???m bao g???m:</div>
                  <div className="pros">
                    {item?.productsInOrder?.map((pro: any) => {
                      let data = pro?.product;
                      let price =
                        pro?.quantity *
                        (data?.price.price -
                          (data?.price.price * data?.discount) / 100);
                      return (
                        <div className="pro">
                          <img
                            src={pro?.product.images[0]}
                            alt="product image"
                            className="ava"
                          />
                          <div className="info">
                            <div className="name">
                              <span>{pro?.product.title}</span>
                            </div>
                            <div className="quantity">
                              <span> x{pro?.quantity}</span>
                            </div>
                          </div>
                          <div className="price">
                            {moneyFormaterDong(price)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {item.processing === "Chua_Xu_Ly" && (
                    <div className="wrap">
                      <div
                        className="btn-cancle"
                        onClick={() => {
                          cancelOrder(item.id);
                        }}
                      >
                        H???y ????n
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="fdsf">Hi???n kh??ng c?? s???n ph???m n??o trong m???c n??y</div>
          )
        ) : (
          <div className="loading">
            <span className="spinner-border spinner-border-sm"></span>
            Loading...
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderPage;
