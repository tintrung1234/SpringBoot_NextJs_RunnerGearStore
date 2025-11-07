import React from 'react'
import Breadcrumb from '../../../components/BreadCrumb';

export default function Terms() {
  return (
    <div className="max-w-[90vw] mx-auto p-6 space-y-6 text-black mt-16 mb-14">
    <div className='mb-8'>
      <Breadcrumb />
    </div>
      <h1 className="text-2xl font-bold text-center">Chính sách và điều khoản sử dụng</h1>
      <p>Chào mừng bạn đến với DealHawk - nơi tổng hợp các ưu đãi và giảm giá hot nhất từ Shopee, Lazada, Tiki và các nền tảng mua sắm trực tuyến khác. Việc truy cập và sử dụng website của chúng tôi đồng nghĩa với việc bạn đồng ý với các điều khoản dưới đây.</p>
      {[{
        title: "1. Chính sách bảo mật thông tin",
        content: [
          "Chúng tôi cam kết bảo vệ quyền riêng tư của bạn. Các thông tin thu thập được (nếu có) như địa chỉ email, lịch sử truy cập, hành vi duyệt trang,... sẽ được sử dụng với mục đích:",
          "Cải thiện trải nghiệm người dùng",
          "Phân tích xu hướng truy cập để tối ưu nội dung",
          "Gửi thông báo khuyến mãi nếu bạn đăng ký nhận tin",
          "Chúng tôi tuyệt đối không bán, trao đổi hay chia sẻ thông tin cá nhân của bạn cho bên thứ ba."
        ]
      }, {
        title: "2. Chính sách liên kết tiếp thị (Affiliate Disclosure)",
        content: [
          "Website này sử dụng liên kết tiếp thị (affiliate) từ các nền tảng thương mại điện tử như Shopee, Lazada, Tiki,... Điều này có nghĩa là chúng tôi có thể nhận được một khoản hoa hồng nhỏ nếu bạn mua hàng qua các liên kết mà chúng tôi chia sẻ.",
          "Quan trọng:",
          "• Bạn không phải trả thêm bất kỳ khoản phí nào khi mua hàng qua liên kết của chúng tôi.",
          "• Chúng tôi luôn ưu tiên đề xuất các sản phẩm có giá trị thực sự — không bị chi phối bởi lợi nhuận affiliate."
        ]
      }, {
        title: "3. Bản quyền nội dung",
        content: [
          "Toàn bộ nội dung trên website (bao gồm hình ảnh, bài viết, bố cục...) thuộc sở hữu của [Tên Website] hoặc được tổng hợp từ các nguồn công khai.",
          "Bạn không được sao chép, sử dụng lại hoặc tái xuất bản bất kỳ phần nào mà không có sự đồng ý bằng văn bản từ chúng tôi."
        ]
      }, {
        title: "4. Trách nhiệm người dùng",
        content: [
          "Khi truy cập website của chúng tôi, bạn đồng ý:",
          "• Không sử dụng website vào mục đích xấu hoặc vi phạm pháp luật.",
          "• Không can thiệp vào hoạt động kỹ thuật hoặc tấn công website.",
          "• Tự chịu trách nhiệm về hành vi mua sắm của mình (chúng tôi không chịu trách nhiệm nếu có lỗi phát sinh từ bên bán như đổi/trả hàng, giao hàng chậm, v.v.)."
        ]
      }, {
        title: "5. Miễn trừ trách nhiệm",
        content: [
          "Chúng tôi không đại diện cho bất kỳ sàn thương mại điện tử nào. Mọi thông tin về giá, khuyến mãi và sản phẩm đều được lấy từ nguồn công khai và có thể thay đổi bất kỳ lúc nào mà không cần báo trước.",
          "Chúng tôi không cam kết 100% thông tin luôn chính xác tại mọi thời điểm, nhưng luôn cố gắng cập nhật nhanh nhất có thể."
        ]
      }, {
        title: "6. Thay đổi chính sách",
        content: [
          "Chúng tôi có quyền cập nhật, chỉnh sửa chính sách bất kỳ lúc nào mà không cần thông báo trước. Các thay đổi sẽ được cập nhật tại trang này. Vui lòng truy cập thường xuyên để theo dõi."
        ]
      }].map((section) => (
        <div key={section.title}>
          <h2 className="text-xl font-bold mt-4">{section.title}</h2>
          {section.content.map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </div>
      ))}
    </div>
  );
}

